export const CONTACT_CONFIG = {
  whatsappNumber: '989123456789',
  phone: '+982188888888',
  phoneHref: 'tel:+982188888888',
  mobile: '+989123456789',
  mobileHref: 'tel:+989123456789',
  email: 'info@aquapro.ir',
}

export function whatsappUrl(text) {
  return `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`
}
