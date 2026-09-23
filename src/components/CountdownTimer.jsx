import { useState, useEffect } from 'react'

export default function CountdownTimer({ targetDate, label = 'زمان باقی‌مانده تا پایان فروش ویژه:' }) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null)
      return
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date()
      if (difference <= 0) {
        return null
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    setTimeLeft(calculateTimeLeft())
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)
      if (!remaining) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  if (!timeLeft) return null

  const formatNum = (n) => new Intl.NumberFormat('fa-IR', { minimumIntegerDigits: 2 }).format(n)

  return (
    <div className="countdown-container">
      {label && <span className="countdown-label">⏱️ {label}</span>}
      <div className="countdown-boxes">
        {timeLeft.days > 0 && (
          <div className="countdown-box">
            <span className="countdown-val">{formatNum(timeLeft.days)}</span>
            <span className="countdown-unit">روز</span>
          </div>
        )}
        <div className="countdown-box">
          <span className="countdown-val">{formatNum(timeLeft.hours)}</span>
          <span className="countdown-unit">ساعت</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-box">
          <span className="countdown-val">{formatNum(timeLeft.minutes)}</span>
          <span className="countdown-unit">دقیقه</span>
        </div>
        <span className="countdown-sep">:</span>
        <div className="countdown-box">
          <span className="countdown-val">{formatNum(timeLeft.seconds)}</span>
          <span className="countdown-unit">ثانیه</span>
        </div>
      </div>
    </div>
  )
}
