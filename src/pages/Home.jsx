import { useEffect } from 'react'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import Products from '../components/Products'
import Calculator from '../components/Calculator'
import Banner from '../components/Banner'

function Home() {
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
      <Products />
      <Calculator />
      <Banner />
    </>
  )
}

export default Home
