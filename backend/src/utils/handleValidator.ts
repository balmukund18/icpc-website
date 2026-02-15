import prisma from '../models/prismaClient';

// Platform URL patterns to extract usernames
const PLATFORM_PATTERNS: Record<string, RegExp> = {
  leetcode: /(?:https?:\/\/)?(?:www\.)?leetcode\.com\/(?:u\/)?([^\/\?#]+)/i,
  codeforces: /(?:https?:\/\/)?(?:www\.)?codeforces\.com\/profile\/([^\/\?#]+)/i,
  codechef: /(?:https?:\/\/)?(?:www\.)?codechef\.com\/users\/([^\/\?#]+)/i,
  atcoder: /(?:https?:\/\/)?(?:www\.)?atcoder\.jp\/users\/([^\/\?#]+)/i,
  hackerrank: /(?:https?:\/\/)?(?:www\.)?hackerrank\.com\/(?:profile\/)?([^\/\?#]+)/i,
  github: /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\?#]+)/i,
};

/**
 * Normalize a handle by extracting username from URL or returning as-is
 * @param platform - Platform name (leetcode, codeforces, etc.)
 * @param value - Handle value (can be username or full URL)
 * @returns Normalized username (lowercase)
 */
export function normalizeHandle(platform: string, value: string): string {
  if (!value) return '';
  
  const pattern = PLATFORM_PATTERNS[platform.toLowerCase()];
  if (!pattern) return value.toLowerCase().trim();
  
  const match = value.match(pattern);
  if (match && match[1]) {
    return match[1].toLowerCase().trim();
  }
  
  // If no URL pattern matched, treat as direct username
  return value.toLowerCase().trim();
}

/**
 * Check if a handle is already claimed by another user
 * @param platform - Platform name
 * @param handle - Handle value to check
 * @param excludeUserId - User ID to exclude from check (for updates)
 * @returns Object with { taken: boolean, claimedBy?: string }
 */
export async function checkHandleAvailability(
  platform: string,
  handle: string,
  excludeUserId?: string
): Promise<{ taken: boolean; claimedBy?: string }> {
  if (!handle) return { taken: false };
  
  const normalizedHandle = normalizeHandle(platform, handle);
  if (!normalizedHandle) return { taken: false };
  
  // Get all profiles with handles
  const profiles = await prisma.profile.findMany({
    where: {
      userId: excludeUserId ? { not: excludeUserId } : undefined,
    },
    select: {
      userId: true,
      handles: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });
  
  // Check each profile's handles
  for (const profile of profiles) {
    const handles = profile.handles as Record<string, string> | null;
    if (!handles) continue;
    
    const existingHandle = handles[platform.toLowerCase()];
    if (!existingHandle) continue;
    
    const normalizedExisting = normalizeHandle(platform, existingHandle);
    if (normalizedExisting === normalizedHandle) {
      return {
        taken: true,
        claimedBy: profile.user?.email || 'another user',
      };
    }
  }
  
  return { taken: false };
}

/**
 * Validate handles object and check for duplicates
 * @param handles - Handles object to validate
 * @param excludeUserId - User ID to exclude from duplicate check
 * @returns Array of error messages (empty if valid)
 */
export async function validateHandles(
  handles: Record<string, string>,
  excludeUserId?: string
): Promise<string[]> {
  const errors: string[] = [];
  
  if (!handles || typeof handles !== 'object') {
    return errors;
  }
  
  const platforms = Object.keys(PLATFORM_PATTERNS);
  
  for (const [platform, handle] of Object.entries(handles)) {
    if (!handle) continue; // Skip empty handles
    
    // Validate platform
    if (!platforms.includes(platform.toLowerCase())) {
      errors.push(`Invalid platform: ${platform}`);
      continue;
    }
    
    // Check for duplicates
    const availability = await checkHandleAvailability(platform, handle, excludeUserId);
    if (availability.taken) {
      const normalizedHandle = normalizeHandle(platform, handle);
      errors.push(
        `${platform} handle "${normalizedHandle}" is already claimed by ${availability.claimedBy}`
      );
    }
  }
  
  return errors;
}
