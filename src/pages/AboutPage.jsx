import { useTranslation } from 'react-i18next'
import About from '../components/About'
import useSeo from '../hooks/useSeo'

function AboutPage() {
  const { t } = useTranslation()

  useSeo({
    title: t('meta.aboutTitle'),
    description: t('meta.aboutDescription'),
    path: '/about/',
  })

  return <About />
}

export default AboutPage
