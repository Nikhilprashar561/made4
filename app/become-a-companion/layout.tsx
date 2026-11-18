import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Become a Host — Earn ₹500–₹800/hr as Good Company',
  description:
    'Monetize your free time showing people around your city, working out, or catching movies. Set your own rate, flexible hours, and withdraw instantly to UPI.',
};

export default function BecomeACompanionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
