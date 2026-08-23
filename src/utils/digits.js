const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩'

function normalizeDigits(value) {
  return String(value ?? '').replace(/[۰-۹٠-٩]/g, d => {
    const p = PERSIAN_DIGITS.indexOf(d)
    if (p !== -1) return String(p)
    return String(ARABIC_DIGITS.indexOf(d))
  })
}

export default normalizeDigits
