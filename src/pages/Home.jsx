import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/Hero'
import Categories from '../components/Categories'
import Products from '../components/Products'
import Calculator from '../components/Calculator'
import Banner from '../components/Banner'

function Home() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [location.hash])

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
