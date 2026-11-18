import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In with Mobile OTP',
  description: 'Fast, secure mobile sign in for made4togethr members and verified hosts.',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
