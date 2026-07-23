export type Language = 'pt' | 'en';

export type PlatformType = 'hotmart' | 'kiwify' | 'eduzz' | 'amazon' | 'shoppee' | 'shopee' | 'monetizze' | 'youtube' | 'kwai' | 'tiktok' | 'instagram' | 'telegram' | 'custom' | 'other';

export interface AffiliateProduct {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  price?: number;
  originalPrice?: number;
  coupon?: string;
  url: string;
  platform: PlatformType;
  category: 'infoproduct' | 'course' | 'gear' | 'ebook' | 'software' | 'promotions';
  imageUrl: string;
  badge?: string;
  featured?: boolean;
  clicks: number;
  rating?: number;
}

export interface SocialChannel {
  id: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'telegram' | 'whatsapp' | 'linkedin' | 'kwai' | 'pinterest' | 'facebook' | 'threads' | 'twitch' | 'discord' | 'twitter' | 'custom';
  title: string;
  handle: string;
  url: string;
  followers?: string;
  iconName: string;
  badge?: string;
  featured?: boolean;
  connected?: boolean;
  lastSyncedAt?: string;
}

export interface UserProfileData {
  name: string;
  handle: string;
  bio: Record<Language, string>;
  avatarUrl: string;
  bannerUrl: string;
  whatsappNumber: string;
  telegramChannel: string;
  email: string;
  location: string;
  verified: boolean;
  totalViews: number;
}

export interface Project {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  fullDescription: Record<Language, string>;
  category: 'web' | 'mobile' | 'ai' | 'open-source';
  tags: string[];
  imageUrl: string;
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  metrics?: string;
  badge?: string;
}

export interface Service {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  iconName: string;
  features: Record<Language, string[]>;
  deliverables: Record<Language, string>;
}

export interface ArticleOrVideo {
  id: string;
  type: 'video' | 'article' | 'podcast';
  title: Record<Language, string>;
  summary: Record<Language, string>;
  url: string;
  date: string;
  readOrWatchTime: string;
  thumbnail: string;
  badge?: string;
}

export interface SocialLink {
  id: string;
  title: string;
  url: string;
  iconName: string;
  handle: string;
  category: 'social' | 'community' | 'work';
  badge?: string;
}

