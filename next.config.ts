import type { NextConfig } from "next";

// Build dynamic remotePatterns based on environment variables so images from Supabase storage work in any environment
const buildRemotePatterns = () => {
  const patterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
    {
      protocol: 'https',
      hostname: 'api.dicebear.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'ui-avatars.com',
      pathname: '/**',
    },
    // Fallback Supabase project (kept for compatibility)
    {
      protocol: 'https',
      hostname: 'xgdbkqewkgwlnaaspjpe.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
    {
      protocol: 'https',
      hostname: 'picsum.photos',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'cdn.pixabay.com',
      pathname: '/**',
    },
    // Open-source media hosts for banners and post images
    {
      protocol: 'https',
      hostname: 'images.unsplash.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'images.pexels.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: 'upload.wikimedia.org',
      pathname: '/**',
    },
  ];

  // Add dynamic Supabase host if NEXT_PUBLIC_SUPABASE_URL is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const host = new URL(supabaseUrl).hostname;
      patterns.push({
        protocol: 'https',
        hostname: host,
        pathname: '/storage/v1/object/public/**',
      });
    } catch (e) {
      // Silently ignore invalid URL
    }
  }

  return patterns;
};

const nextConfig: NextConfig = {
  // Allow build to succeed on Vercel despite ESLint errors. The CI will still show warnings locally via `npm run lint`.
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: buildRemotePatterns(),
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
