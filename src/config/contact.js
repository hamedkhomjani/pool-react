export const CONTACT_CONFIG = {
  whatsappNumber: '46762573273',
  phone: '+46762573273',
  phoneHref: 'tel:+46762573273',
  mobile: '+46762573273',
  mobileHref: 'tel:+46762573273',
  email: 'info@aquapro.ir',
}

export function whatsappUrl(text) {
  return `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`
}
