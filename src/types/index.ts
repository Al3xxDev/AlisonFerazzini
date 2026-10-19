export type PhotoCategory = 'all' | 'dj-events' | 'lifestyle' | 'food-drink' | 'weddings' | 'private-events';

export interface Photo {
  id: string;
  filename: string;
  title: string;
  category: string;
  categoryLabel: string;
  context: string;
  description: string;
  featured: boolean;
  heroCandidate: boolean;
  width: number;
  height: number;
  aspectRatio: number;
  lqip: string;
  src: string;
  srcLarge: string;
  srcMedium: string;
  srcThumb: string;
  srcset: string;
  sizes: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  imageSrc: string;
  imageAlt: string;
  tag: string;
}
