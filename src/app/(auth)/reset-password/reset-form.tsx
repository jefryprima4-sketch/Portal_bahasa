'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPassword } from './actions';

export function ResetPasswordForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');
    const result = await resetPassword(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-green-600 text-3xl">mark_email_read</span>
        </div>
        <p className="text-sm text-slate-600 font-medium">
          Link reset password telah dikirim ke email Anda. Silakan cek inbox dan folder spam.
        </p>
        <a href="/login" className="block text-sm font-bold text-primary hover:underline">
          Kembali ke halaman login
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">
          {error}
        </div>
      )}
      <Input
        label="Email Institusi"
        name="email"
        type="email"
        placeholder="id@ptki.ac.id"
        required
        className="h-12 rounded-xl bg-white border-slate-200 focus:ring-primary/20"
      />
      <Button type="submit" disabled={loading} size="lg" className="w-full h-14 rounded-2xl text-base shadow-xl font-bold">
        {loading ? 'Mengirim...' : 'Kirim Link Reset'}
      </Button>
    </form>
  );
}
