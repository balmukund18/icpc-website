import prisma from '../models/prismaClient';

/**
 * Normalize phone number by removing spaces, dashes, and country code
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  // Remove spaces, dashes, parentheses, and +91 prefix
  return phone
    .replace(/[\s\-\(\)\+]/g, '')
    .replace(/^91/, '') // Remove country code if present
    .trim()
    .toLowerCase();
}

/**
 * Normalize LinkedIn URL to extract profile identifier
 */
export function normalizeLinkedIn(url: string): string {
  if (!url) return '';
  
  // Extract LinkedIn username/profile from URL
  const linkedInPattern = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([^\/\?#]+)/i;
  const match = url.match(linkedInPattern);
  
  if (match && match[1]) {
    return match[1].toLowerCase().trim();
  }
  
  // If no URL pattern matched, treat as direct username
  return url.toLowerCase().trim();
}

/**
 * Check if a phone number is already claimed by another user
 */
export async function checkPhoneAvailability(
  phone: string,
  excludeUserId?: string
): Promise<{ taken: boolean; claimedBy?: string }> {
  if (!phone) return { taken: false };
  
  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone || normalizedPhone.length < 10) return { taken: false };
  
  // Get all profiles with contact numbers
  const profiles = await prisma.profile.findMany({
    where: {
      userId: excludeUserId ? { not: excludeUserId } : undefined,
      contact: { not: '' },
    },
    select: {
      userId: true,
      contact: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });
  
  // Check each profile's contact
  for (const profile of profiles) {
    if (!profile.contact) continue;
    
    const normalizedExisting = normalizePhone(profile.contact);
    if (normalizedExisting === normalizedPhone) {
      return {
        taken: true,
        claimedBy: profile.user?.email || 'another user',
      };
    }
  }
  
  return { taken: false };
}

/**
 * Check if a LinkedIn profile is already claimed by another user
 */
export async function checkLinkedInAvailability(
  linkedIn: string,
  excludeUserId?: string
): Promise<{ taken: boolean; claimedBy?: string }> {
  if (!linkedIn) return { taken: false };
  
  const normalizedLinkedIn = normalizeLinkedIn(linkedIn);
  if (!normalizedLinkedIn) return { taken: false };
  
  // Get all profiles with LinkedIn URLs
  const profiles = await prisma.profile.findMany({
    where: {
      userId: excludeUserId ? { not: excludeUserId } : undefined,
      linkedIn: { not: null },
    },
    select: {
      userId: true,
      linkedIn: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });
  
  // Check each profile's LinkedIn
  for (const profile of profiles) {
    if (!profile.linkedIn) continue;
    
    const normalizedExisting = normalizeLinkedIn(profile.linkedIn);
    if (normalizedExisting === normalizedLinkedIn) {
      return {
        taken: true,
        claimedBy: profile.user?.email || 'another user',
      };
    }
  }
  
  return { taken: false };
}

/**
 * Validate profile fields for duplicates
 * @param data - Profile data to validate
 * @param excludeUserId - User ID to exclude from duplicate check
 * @returns Array of error messages (empty if valid)
 */
export async function validateProfileFields(
  data: { contact?: string; linkedIn?: string | null },
  excludeUserId?: string
): Promise<string[]> {
  const errors: string[] = [];
  
  // Check phone number
  if (data.contact) {
    const phoneAvailability = await checkPhoneAvailability(data.contact, excludeUserId);
    if (phoneAvailability.taken) {
      errors.push(
        `Contact number is already registered with ${phoneAvailability.claimedBy}`
      );
    }
  }
  
  // Check LinkedIn URL
  if (data.linkedIn) {
    const linkedInAvailability = await checkLinkedInAvailability(data.linkedIn, excludeUserId);
    if (linkedInAvailability.taken) {
      const normalizedLinkedIn = normalizeLinkedIn(data.linkedIn);
      errors.push(
        `LinkedIn profile "${normalizedLinkedIn}" is already linked to ${linkedInAvailability.claimedBy}`
      );
    }
  }
  
  return errors;
}
