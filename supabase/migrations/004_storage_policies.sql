-- =====================
-- STORAGE SETUP
-- =====================

-- 1. Buat Bbuckets (jika belum ada)
-- course-materials untuk PDF dan Video
INSERT INTO storage.buckets (id, name, public) 
VALUES ('course-materials', 'course-materials', true)
ON CONFLICT (id) DO NOTHING;

-- audio-materials untuk file Listening
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-materials', 'audio-materials', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Kebijakan RLS untuk STORAGE.OBJECTS

-- Hapus kebijakan lama jika ada untuk menghindari duplikasi
DROP POLICY IF EXISTS "Dosen bisa upload materi" ON storage.objects;
DROP POLICY IF EXISTS "Dosen bisa akses-semua di folder course tertentu" ON storage.objects;
DROP POLICY IF EXISTS "Publik bisa download materi" ON storage.objects;

-- Kebijakan UNTUK UPLOAD (Hanya Admin / Dosen)
CREATE POLICY "Dosen bisa upload materi"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  (bucket_id = 'course-materials' OR bucket_id = 'audio-materials') AND
  public.get_my_role() IN ('instructor', 'admin')
);

-- Kebijakan UNTUK UPDATE/DELETE (Hanya Admin / Pemilik Course)
-- Catatan: Untuk kesederhanaan MVP, kita izinkan Admin & Dosen dulu.
CREATE POLICY "Dosen bisa kelola materi"
ON storage.objects FOR ALL
TO authenticated
USING (
  (bucket_id = 'course-materials' OR bucket_id = 'audio-materials') AND
  public.get_my_role() IN ('instructor', 'admin')
)
WITH CHECK (
  (bucket_id = 'course-materials' OR bucket_id = 'audio-materials') AND
  public.get_my_role() IN ('instructor', 'admin')
);

-- Kebijakan UNTUK SELECT (Semua user terotentikasi bisa baca)
CREATE POLICY "Semua user bisa baca materi"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'course-materials' OR bucket_id = 'audio-materials');
