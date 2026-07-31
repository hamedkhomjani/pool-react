function translateProduct(t, product) {
  if (!product) return product
  const base = `product.items.${product.key}`
  const data = t(base, { returnObjects: true }) || {}
  return {
    ...product,
    badge: data.badge,
    title: data.title,
    desc: data.desc,
    price: data.price,
    longDesc: data.longDesc,
    features: data.features || [],
    specs: data.specs || {},
    detailSpecs: data.detailSpecs || {},
  }
}

function translateSpecLabel(t, key) {
  return t(`product.detailLabels.${key}`, { defaultValue: key })
}

function translateChipLabel(t, key) {
  return t(`product.specLabels.${key}`, { defaultValue: key })
}

export { translateProduct, translateSpecLabel, translateChipLabel }
