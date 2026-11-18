import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Meetups & 4-Digit Start Codes',
  description: 'View your upcoming and active platonic meetups, secret start codes, and venue directions on made4togethr.',
};

export default function BookingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
