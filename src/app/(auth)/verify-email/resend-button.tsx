'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { resendVerificationEmail } from './actions';

export function ResendEmailButton({ email }: { email?: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendVerificationEmail(email);
      setSent(true);
    } catch {
      // Silently fail - user can try again
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      {sent ? (
        <p className="text-sm text-green-600 font-medium">Email verifikasi telah dikirim ulang!</p>
      ) : (
        <Button variant="outline" onClick={handleResend} disabled={loading} className="w-full">
          {loading ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
        </Button>
      )}
    </div>
  );
}
