import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Questions Answered — Platonic Rules, Escrow & Safety FAQ',
  description:
    'Answers to all your questions about hiring local companions, escrow payments, ID verification, 4-digit start codes, and meetup safety in India.',
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
