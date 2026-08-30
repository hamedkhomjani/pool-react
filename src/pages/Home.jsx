import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import useSeo from '../hooks/useSeo'
import { SITE_URL } from '../config/site'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import FeaturedProducts from '../components/FeaturedProducts'
import Products from '../components/Products'
import Calculator from '../components/Calculator'
import Banner from '../components/Banner'

function Home() {
  const { t, i18n } = useTranslation()

  const jsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${SITE_URL}/#organization`,
          name: 'AquaPro | آکوا پرو',
          url: SITE_URL,
          logo: `${SITE_URL}/favicon.svg`,
          sameAs: [
            'https://www.instagram.com/aquapro.ir',
            'https://t.me/aquapro.ir',
            'https://www.linkedin.com/company/aquapro.ir',
          ],
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          url: SITE_URL,
          name: t('brand'),
          publisher: { '@id': `${SITE_URL}/#organization` },
          inLanguage: i18n.language === 'en' ? 'en' : 'fa',
        },
      ],
    }),
    [t, i18n.language],
  )

  useSeo({
    title: t('meta.homeTitle'),
    description: t('meta.homeDescription'),
    path: '/',
    jsonLd,
  })

  useEffect(() => {
    window.scrollTo(0, 0)
    const target = sessionStorage.getItem('scrollTo')
    if (target) {
      sessionStorage.removeItem('scrollTo')
      requestAnimationFrame(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [])

  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Products />
      <Calculator />
      <Banner />
    </>
  )
}

export default Home
