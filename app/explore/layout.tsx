import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Verified Local Companions & Buddies in India',
  description:
    'Browse ID-verified local companions for the gym, movies, coffee chats, food walks, and events across Indian metros. Filter by city, activity, and availability.',
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
