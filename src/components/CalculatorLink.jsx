import { useNavigate } from 'react-router-dom'

function CalculatorLink({ className = 'guide-inline-link', children }) {
  const navigate = useNavigate()
  return (
    <a
      href="/#calculator"
      className={className}
      onClick={e => {
        e.preventDefault()
        sessionStorage.setItem('scrollTo', 'calculator')
        navigate('/')
      }}
    >
      {children}
    </a>
  )
}

export default CalculatorLink
