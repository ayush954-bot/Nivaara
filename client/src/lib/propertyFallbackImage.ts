/**
 * Real property-type fallback images sourced from CDN.
 * Used when a property has no uploaded photo — shows a real Indian property photo
 * matching the property type (land, shop, apartment, villa, etc.)
 */

const FALLBACK_URLS: Record<string, string> = {
  land:        'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/FKPDBKrfXoEnJOZE.jpg',
  plot:        'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/FKPDBKrfXoEnJOZE.jpg',
  apartment:   'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/PyPGpmJePOhPWheZ.jpg',
  flat:        'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/PyPGpmJePOhPWheZ.jpg',
  studio:      'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/PyPGpmJePOhPWheZ.jpg',
  shop:        'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/dYywXDhvDqLjtzTi.jpg',
  commercial:  'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/dYywXDhvDqLjtzTi.jpg',
  villa:       'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/XdtflKuhgeLavIKE.jpg',
  bungalow:    'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/XdtflKuhgeLavIKE.jpg',
  rowhouse:    'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/XdtflKuhgeLavIKE.jpg',
  'row house': 'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/XdtflKuhgeLavIKE.jpg',
  office:      'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/izbjhVqThmlWGrye.jpg',
  warehouse:   'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/izbjhVqThmlWGrye.jpg',
  penthouse:   'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/RksHVpsoDeaKhzKt.jpg',
  default:     'https://files.manuscdn.com/user_upload_by_module/session_file/310419663026719415/PyPGpmJePOhPWheZ.jpg',
};

/**
 * Returns the CDN URL of the real property photo for the given type.
 * Falls back to apartment photo if type is unknown.
 */
export function getFallbackImageUrl(propertyType?: string | null): string {
  const key = (propertyType ?? 'default').toLowerCase().trim();
  return FALLBACK_URLS[key] ?? FALLBACK_URLS.default;
}

/**
 * Legacy alias — kept for backward compatibility with ShareWithImage.
 * Returns the same CDN URL (not a data URL anymore).
 */
export function generateFallbackImageDataUrl(propertyType?: string): string {
  return getFallbackImageUrl(propertyType);
}
