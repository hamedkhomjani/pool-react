// Localized label lookups for product spec keys. Product content itself now
// lives in the catalog (src/data/catalog), not in the i18n bundles; these
// helpers translate only the spec/chip LABELS, which are UI chrome.

function translateSpecLabel(t, key) {
  return t(`product.detailLabels.${key}`, { defaultValue: key })
}

function translateChipLabel(t, key) {
  return t(`product.specLabels.${key}`, { defaultValue: key })
}

export { translateSpecLabel, translateChipLabel }