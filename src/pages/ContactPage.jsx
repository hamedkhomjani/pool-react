import { useState } from 'react'
import Reveal from '../components/Reveal'

const contactInfo = [
  { icon: '📞', label: 'تلفن تماس', value: '۰۲۱-۸۸۸۸۸۸۸۸', href: 'tel:+982188888888' },
  { icon: '📱', label: 'موبایل', value: '۰۹۱۲-۳۴۵-۶۷۸۹', href: 'tel:+989123456789' },
  { icon: '📧', label: 'ایمیل', value: 'info@aquapro.ir', href: 'mailto:info@aquapro.ir' },
  { icon: '📍', label: 'آدرس', value: 'تهران، خیابان نیاوران، خیابان کامرانیه جنوبی، پلاک ۳۸' },
  { icon: '🕐', label: 'ساعات کاری', value: 'شنبه تا چهارشنبه ۹ الی ۱۸ / پنجشنبه ۹ الی ۱۴' },
]

function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <section className="contact-section">
      <div className="container">
        <Reveal>
          <div className="section-header">
            <h2>تماس با ما</h2>
            <p>کارشناسان ما آماده پاسخگویی به سوالات شما هستند</p>
          </div>
        </Reveal>

        <div className="contact-grid">
          <Reveal direction="right">
            <div className="contact-form-card">
            <h3>فرم تماس</h3>
            {sent ? (
              <div className="contact-success">
                <div className="success-icon">✅</div>
                <h4>پیام شما با موفقیت ارسال شد</h4>
                <p>کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت.</p>
                <button className="btn btn-primary" onClick={() => { setSent(false); setForm({ name: '', phone: '', email: '', subject: '', message: '' }) }}>ارسال پیام جدید</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>نام و نام خانوادگی</label>
                    <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="مثلاً علی محمدی" />
                  </div>
                  <div className="form-group">
                    <label>شماره تماس</label>
                    <input type="tel" name="phone" required value={form.phone} onChange={handleChange} placeholder="مثلاً ۰۹۱۲۳۴۵۶۷۸۹" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>ایمیل (اختیاری)</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="مثلاً info@example.com" />
                  </div>
                  <div className="form-group">
                    <label>موضوع</label>
                    <input type="text" name="subject" required value={form.subject} onChange={handleChange} placeholder="مثلاً مشاوره خرید پمپ" />
                  </div>
                </div>
                <div className="form-group">
                  <label>پیام</label>
                  <textarea name="message" rows="5" required value={form.message} onChange={handleChange} placeholder="پیام خود را بنویسید..."></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>ارسال پیام</button>
              </form>
            )}
            </div>
          </Reveal>

          <Reveal direction="left">
            <div className="contact-info-card">
            <h3>اطلاعات تماس</h3>
            <div className="contact-list">
              {contactInfo.map((item, i) => (
                <div className="contact-item" key={i}>
                  <div className="contact-item-icon">{item.icon}</div>
                  <div>
                    <div className="contact-item-label">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="contact-item-value">{item.value}</a>
                    ) : (
                      <div className="contact-item-value">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            </div>
          </Reveal>
        </div>

        <Reveal>
          <div className="contact-map">
          <iframe
            title="موقعیت آکوا پرو"
            src="https://www.google.com/maps?q=تهران+نیاوران+کامرانیه+جنوبی&output=embed"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        </Reveal>

      </div>
    </section>
  )
}

export default ContactPage
