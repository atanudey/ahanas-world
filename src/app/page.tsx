import { connection } from 'next/server';
import { getPublishedContent } from '@/lib/content/public';
import { HomeView } from '@/components/public/HomeView';

export default async function HomePage() {
  // Render per request so newly published work appears straight away.
  await connection();
  const items = await getPublishedContent('home');
  return <HomeView items={items} />;
}
