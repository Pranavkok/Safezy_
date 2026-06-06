import { Metadata } from 'next';
import ResetConfirmClient from './ResetConfirmClient';

export const metadata: Metadata = {
  title: 'Safezy - Reset Password'
};

export default function ResetConfirmPage({
  searchParams
}: {
  searchParams: { code?: string };
}) {
  return <ResetConfirmClient code={searchParams.code ?? ''} />;
}
