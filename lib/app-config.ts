/**
 * Application configuration
 * Centralized configuration for app metadata and settings
 */

export interface AppConfig {
  name: string;
  version: string;
  domain: string;
  description: string;
  supportEmail: string;
  documentationUrl?: string;
  lastUpdated?: string;
}

export const APP_CONFIG: AppConfig = {
  name: 'Nuclear Supply Chain',
  version: '1.0.0',
  domain: 'nuclear-nextjs.vercel.app', // Update after domain purchase
  description: 'Secure medical isotope procurement and logistics platform',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@nuclear-supply.example',
  documentationUrl: '/docs',
  lastUpdated: '2026-01-16',
};
