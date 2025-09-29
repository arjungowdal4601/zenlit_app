import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Validation functions
const validateUrl = (url: string, platform: string): boolean => {
  if (!url) return true; // Empty URLs are allowed
  
  try {
    const urlObj = new URL(url);
    
    switch (platform) {
      case 'instagram':
        return urlObj.hostname === 'instagram.com' || urlObj.hostname === 'www.instagram.com';
      case 'twitter':
      case 'x':
        return urlObj.hostname === 'twitter.com' || urlObj.hostname === 'www.twitter.com' || 
               urlObj.hostname === 'x.com' || urlObj.hostname === 'www.x.com';
      case 'linkedin':
        return urlObj.hostname === 'linkedin.com' || urlObj.hostname === 'www.linkedin.com';
      default:
        return false;
    }
  } catch {
    return false;
  }
};

const validateBio = (bio: string): boolean => {
  return bio.length <= 500; // Assuming 500 character limit
};

const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size too large. Maximum size is 10MB.' };
  }

  return { valid: true };
};

export async function POST(request: NextRequest) {
  try {
    // Create a response to allow Supabase to set/refresh auth cookies
    const internalRes = new NextResponse();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Prefer Authorization header if provided by client; fallback to SSR cookies
    const authHeader = request.headers.get('authorization') ?? '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    let supabase: any;
    if (bearerToken) {
      // Use the provided bearer token for RLS and auth
      supabase = createClient(url, anon, {
        global: {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      });
    } else {
      // Create authenticated Supabase client with cookie handlers (read + write)
      const cookieStore = await cookies();
      supabase = createServerClient(url, anon, {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            internalRes.cookies.set(name, value, options);
          },
          remove(name: string, _options: CookieOptions) {
            internalRes.cookies.delete(name);
          },
        },
      });
    }

    // Ensure request is authenticated; derive userId from auth context
    const { data: { user: authUser }, error: authError } = await (bearerToken
      ? supabase.auth.getUser(bearerToken)
      : supabase.auth.getUser());

    if (authError || !authUser) {
      const response = NextResponse.json({ error: 'Unauthorized: please sign in.' }, { status: 401 });
      const setCookie = internalRes.headers.get('set-cookie');
      if (setCookie) response.headers.set('set-cookie', setCookie);
      return response;
    }

    const serverUserId = authUser.id;

    // Parse form data
    const formData = await request.formData();
    
    const bio = formData.get('bio') as string || '';
    const instagramUrl = formData.get('instagram') as string || '';
    const twitterUrl = formData.get('twitter') as string || '';
    const linkedinUrl = formData.get('linkedin') as string || '';
    
    const profileImage = formData.get('profileImage') as File | null;
    const bannerImage = formData.get('bannerImage') as File | null;

    // Validate inputs
    if (!validateBio(bio)) {
      const response = NextResponse.json(
        { error: 'Bio must be 500 characters or less' },
        { status: 400 }
      );
      const setCookie = internalRes.headers.get('set-cookie');
      if (setCookie) response.headers.set('set-cookie', setCookie);
      return response;
    }

    if (!validateUrl(instagramUrl, 'instagram')) {
      const response = NextResponse.json(
        { error: 'Invalid Instagram URL format' },
        { status: 400 }
      );
      const setCookie = internalRes.headers.get('set-cookie');
      if (setCookie) response.headers.set('set-cookie', setCookie);
      return response;
    }

    if (!validateUrl(twitterUrl, 'twitter')) {
      const response = NextResponse.json(
        { error: 'Invalid Twitter/X URL format' },
        { status: 400 }
      );
      const setCookie = internalRes.headers.get('set-cookie');
      if (setCookie) response.headers.set('set-cookie', setCookie);
      return response;
    }

    if (!validateUrl(linkedinUrl, 'linkedin')) {
      const response = NextResponse.json(
        { error: 'Invalid LinkedIn URL format' },
        { status: 400 }
      );
      const setCookie = internalRes.headers.get('set-cookie');
      if (setCookie) response.headers.set('set-cookie', setCookie);
      return response;
    }

    // Validate image files
    if (profileImage) {
      const validation = validateImageFile(profileImage);
      if (!validation.valid) {
        const response = NextResponse.json(
          { error: `Profile image: ${validation.error}` },
          { status: 400 }
        );
        const setCookie = internalRes.headers.get('set-cookie');
        if (setCookie) response.headers.set('set-cookie', setCookie);
        return response;
      }
    }

    if (bannerImage) {
      const validation = validateImageFile(bannerImage);
      if (!validation.valid) {
        const response = NextResponse.json(
          { error: `Banner image: ${validation.error}` },
          { status: 400 }
        );
        const setCookie = internalRes.headers.get('set-cookie');
        if (setCookie) response.headers.set('set-cookie', setCookie);
        return response;
      }
    }

    // Handle image uploads
    let profilePicUrl = '';
    let bannerUrl = '';

    if (profileImage) {
      const profileFileName = `${serverUserId}/profile_${Date.now()}.${profileImage.name.split('.').pop()}`;
      const { data: profileUpload, error: profileUploadError } = await supabase.storage
        .from('profile-media')
        .upload(profileFileName, profileImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (profileUploadError) {
        console.error('Profile image upload error:', profileUploadError);
        const response = NextResponse.json(
          { error: 'Failed to upload profile image' },
          { status: 500 }
        );
        const setCookie = internalRes.headers.get('set-cookie');
        if (setCookie) response.headers.set('set-cookie', setCookie);
        return response;
      }

      // Get public URL
      const { data: profilePublicUrl } = supabase.storage
        .from('profile-media')
        .getPublicUrl(profileUpload.path);
      
      profilePicUrl = profilePublicUrl.publicUrl;
    }

    if (bannerImage) {
      const bannerFileName = `${serverUserId}/banner_${Date.now()}.${bannerImage.name.split('.').pop()}`;
      const { data: bannerUpload, error: bannerUploadError } = await supabase.storage
        .from('profile-media')
        .upload(bannerFileName, bannerImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (bannerUploadError) {
        console.error('Banner image upload error:', bannerUploadError);
        const response = NextResponse.json(
          { error: 'Failed to upload banner image' },
          { status: 500 }
        );
        const setCookie = internalRes.headers.get('set-cookie');
        if (setCookie) response.headers.set('set-cookie', setCookie);
        return response;
      }

      // Get public URL
      const { data: bannerPublicUrl } = supabase.storage
        .from('profile-media')
        .getPublicUrl(bannerUpload.path);
      
      bannerUrl = bannerPublicUrl.publicUrl;
    }

    // Check if social_links record exists for this user
    const { data: existingSocialLinks, error: checkError } = await supabase
      .from('social_links')
      .select('id')
      .eq('id', serverUserId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing social links:', checkError);
      const response = NextResponse.json(
        { error: 'Database error while checking existing social links' },
        { status: 500 }
      );
      const setCookie = internalRes.headers.get('set-cookie');
      if (setCookie) response.headers.set('set-cookie', setCookie);
      return response;
    }

    // Prepare update data
    const updateData: any = {
      bio: bio || null,
      instagram: instagramUrl || null,
      x_twitter: twitterUrl || null,
      linkedin: linkedinUrl || null,
    };

    // Only update image URLs if new images were uploaded
    if (profilePicUrl) {
      updateData.profile_pic_url = profilePicUrl;
    }
    if (bannerUrl) {
      updateData.banner_url = bannerUrl;
    }

    // Update or insert social_links record
    let result;
    if (existingSocialLinks) {
      const { data, error } = await supabase
        .from('social_links')
        .update(updateData)
        .eq('id', serverUserId)
        .select()
        .single();

      result = { data, error };
    } else {
      const { data, error } = await supabase
        .from('social_links')
        .insert({
          id: serverUserId,
          ...updateData,
        })
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error('Error saving social links:', result.error);
      console.error('Error details:', {
        code: result.error.code,
        message: result.error.message,
        details: result.error.details,
        hint: result.error.hint,
      });

      const response = NextResponse.json(
        { error: result.error.message || 'Failed to save social profile data' },
        { status: 500 }
      );
      const setCookie = internalRes.headers.get('set-cookie');
      if (setCookie) response.headers.set('set-cookie', setCookie);
      return response;
    }

    const response = NextResponse.json({
      success: true,
      socialLinks: result.data,
      message: existingSocialLinks ? 'Social profile updated successfully' : 'Social profile created successfully',
    });
    const setCookie = internalRes.headers.get('set-cookie');
    if (setCookie) response.headers.set('set-cookie', setCookie);
    return response;
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}