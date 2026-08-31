import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCatalog } from '../hooks/useCatalog'
import Reveal from './Reveal'
import ProductModal from './ProductModal'
import ProductCard from './ProductCard'

function Products() {
  const { t } = useTranslation()
  const [selectedKey, setSelectedKey] = useState(null)
  const catalog = useCatalog()

  const selected = selectedKey ? catalog?.product(selectedKey) : null

  return (
    <>
      <section className="products-section" id="products">
        <div className="container">
          <Reveal>
            <div className="section-header">
              <h2>{t('productsSection.title')}</h2>
              <p>{t('productsSection.subtitle')}</p>
            </div>
          </Reveal>
          {!catalog ? (
            <section className="page-loading" aria-hidden="true">
              <div className="page-loading-spinner" />
            </section>
          ) : (
            <div className="product-grid">
              {catalog.products.map((product, index) => (
                <Reveal key={product.key} delay={index * 80}>
                  <ProductCard product={product} onSelect={() => setSelectedKey(product.key)} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {selected && <ProductModal product={selected} onClose={() => setSelectedKey(null)} />}
    </>
  )
}

export default Products
