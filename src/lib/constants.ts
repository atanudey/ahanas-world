import {
  Sparkles, Music, Palette, Rocket, BookOpen, Award,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export const TABS: Tab[] = [
  { id: 'home', label: 'Home', icon: Sparkles, href: '/' },
  { id: 'music', label: 'Songs from the Stars', icon: Music, href: '/music' },
  { id: 'art', label: 'From the Sketchbook', icon: Palette, href: '/art' },
  { id: 'space', label: 'Tiny Science Wonders', icon: Rocket, href: '/space' },
  { id: 'reading', label: 'Books That Spark', icon: BookOpen, href: '/reading' },
  { id: 'milestones', label: 'Growth Journey', icon: Award, href: '/milestones' },
];

export type ContentType = 'song' | 'video' | 'art' | 'reading' | 'space_science' | 'milestone';
export type ContentStatus = 'draft' | 'review_needed' | 'scheduled' | 'published' | 'failed' | 'archived' | 'private';
export type Visibility = 'public' | 'private' | 'internal';
export type SectionId = 'home' | 'music' | 'art' | 'space' | 'reading' | 'milestones';

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  date: string;
  category: string;
  views: number;
  status: ContentStatus;
  visibility: Visibility;
  sections: SectionId[];
  thumbnail: string;
  description: string;
  story: string;
  platforms: string[];
  medium: string;
}

export const MOCK_CONTENT: ContentItem[] = [
  {
    id: '1',
    type: 'song',
    title: 'Stars in my Pocket',
    slug: 'stars-in-my-pocket',
    date: '2023-10-12',
    category: 'Original Composition',
    views: 1240,
    status: 'published',
    visibility: 'public',
    sections: ['home', 'music', 'space'],
    thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600',
    description: 'A melody found while staring at Orion.',
    story: 'Ahana wrote this after her first visit to the planetarium. She hummed the melody for three days straight!',
    platforms: ['YouTube', 'Instagram'],
    medium: 'Acoustic & Vocals',
  },
  {
    id: '2',
    type: 'art',
    title: 'The Mars Garden',
    slug: 'the-mars-garden',
    date: '2023-11-05',
    category: 'Watercolor',
    views: 850,
    status: 'published',
    visibility: 'public',
    sections: ['home', 'art', 'space'],
    thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600',
    description: 'Imagining botanicals in the red dust.',
    story: "We discussed how life might survive on Mars, and Ahana decided they would need 'glass bubbles' for sun.",
    platforms: ['Instagram'],
    medium: 'Watercolor & Ink',
  },
  {
    id: '3',
    type: 'video',
    title: 'Nebula Flow',
    slug: 'nebula-flow',
    date: '2023-12-01',
    category: 'Dance',
    views: 2100,
    status: 'scheduled',
    visibility: 'private',
    sections: ['home', 'milestones'],
    thumbnail: 'https://images.unsplash.com/photo-1464802686167-b939a67e06a1?w=600',
    description: 'Modern movements inspired by stardust.',
    story: 'The costume was handmade by Ahana using recycled silk.',
    platforms: ['YouTube'],
    medium: 'Contemporary Dance',
  },
  {
    id: '4',
    type: 'reading',
    title: 'The Girl Who Drank the Moon',
    slug: 'the-girl-who-drank-the-moon',
    date: '2023-12-10',
    category: 'Book Review',
    views: 420,
    status: 'published',
    visibility: 'public',
    sections: ['home', 'reading'],
    thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
    description: 'Why this story made me want to paint with purples.',
    story: 'Ahana finished this book in two days and immediately asked for more moonlight-colored paint.',
    platforms: ['Website'],
    medium: 'Literary Reflection',
  },
  {
    id: '5',
    type: 'milestone',
    title: 'First Stage Performance',
    slug: 'first-stage-performance',
    date: '2023-06-15',
    category: 'Milestone',
    views: 3200,
    status: 'published',
    visibility: 'public',
    sections: ['milestones'],
    thumbnail: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600',
    description: 'The day Ahana sang on a real stage for the very first time.',
    story: 'She was nervous for exactly 10 seconds. Then the music started and she forgot there was an audience at all.',
    platforms: ['YouTube', 'Instagram'],
    medium: 'Live Performance',
  },
  {
    id: '6',
    type: 'milestone',
    title: '100 Days of Practice',
    slug: '100-days-of-practice',
    date: '2023-09-20',
    category: 'Achievement',
    views: 1800,
    status: 'published',
    visibility: 'public',
    sections: ['milestones'],
    thumbnail: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=600',
    description: 'A hundred days without missing a single practice session.',
    story: 'Rain or shine, school day or holiday — Ahana showed up every single day. The streak became its own kind of music.',
    platforms: ['Website'],
    medium: 'Creative Discipline',
  },
  {
    id: '7',
    type: 'art',
    title: 'Cosmic Butterfly Garden',
    slug: 'cosmic-butterfly-garden',
    date: '2024-01-08',
    category: 'Mixed Media',
    views: 670,
    status: 'published',
    visibility: 'public',
    sections: ['home', 'art', 'milestones'],
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600',
    description: 'Butterflies made of constellations, painted on recycled paper.',
    story: 'Ahana combined her love of space and nature into one painting. She said the butterflies are "flying between galaxies."',
    platforms: ['Instagram'],
    medium: 'Acrylic & Collage',
  },
];
