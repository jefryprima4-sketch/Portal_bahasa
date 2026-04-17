import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Muat environment variables dari .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function initAdmin() {
  const email = 'jefryprima4@gmail.com';
  const password = 'password123'; // Silakan ganti setelah berhasil login
  const name = 'Admin Jefry';
  const nim_nip = 'ADM-001';

  console.log(`--- Memulai Inisialisasi Admin: ${email} ---`);

  // 1. Cek apakah user sudah ada
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Gagal mengambil daftar user:', listError.message);
    return;
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    console.log(`User ${email} sudah ada. Menghapus untuk reset...`);
    const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
    if (deleteError) {
      console.error('Gagal menghapus user lama:', deleteError.message);
      return;
    }
  }

  // 2. Buat user baru dengan role admin
  console.log('Membuat user di auth.users...');
  const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      nim_nip,
      role: 'admin'
    }
  });

  if (createError || !user) {
    console.error('Gagal membuat user:', createError?.message);
    return;
  }

  console.log('User berhasil dibuat dengan ID:', user.id);

  // 3. Pastikan profil di public.users terbuat (biasanya otomatis via trigger, tapi kita pastikan)
  console.log('Memverifikasi profil di public.users...');
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.log('Profil belum terbuat otomatis. Menambahkan manual...');
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        name: name,
        nim_nip: nim_nip,
        role: 'admin'
      });

    if (insertError) {
      console.error('Gagal menambahkan profil manual:', insertError.message);
    } else {
      console.log('Profil berhasil ditambahkan manual.');
    }
  } else {
    console.log('Profil sudah terverifikasi di public.users.');
  }

  console.log('\n--- SELESAI ---');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Role: ADMIN');
  console.log('\nSilakan login di http://localhost:3000/login');
}

initAdmin();
