'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { SafezyLogo } from '@/assets';

export default function ResetConfirmClient({ code }: { code: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    if (!code) return;
    setLoading(true);
    router.push(`/auth/callback?code=${encodeURIComponent(code)}`);
  };

  if (!code) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <p className="text-gray-600">
          This reset link is invalid or has already been used.
        </p>
        <Button variant="outline" onClick={() => router.push('/forgot-password')}>
          Request a new link
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Reset Your Password</h1>
        <p className="text-gray-500 max-w-sm">
          Click the button below to proceed to set a new password for your account.
        </p>
      </div>
      <Button onClick={handleReset} disabled={loading} className="min-w-40">
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting...
          </span>
        ) : (
          'Reset Password'
        )}
      </Button>
    </div>
  );
}
