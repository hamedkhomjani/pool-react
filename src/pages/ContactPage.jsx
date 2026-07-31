import { useState } from 'react'
import Reveal from '../components/Reveal'

const CONTACT_CONFIG = {
  whatsappNumber: '989123456789',
  email: 'info@aquapro.ir',
}

const contactInfo = [
  { icon: '📞', label: 'تلفن تماس', value: '۰۲۱-۸۸۸۸۸۸۸۸', href: 'tel:+982188888888' },
  { icon: '📱', label: 'موبایل', value: '۰۹۱۲-۳۴۵-۶۷۸۹', href: 'tel:+989123456789' },
  { icon: '📧', label: 'ایمیل', value: CONTACT_CONFIG.email, href: `mailto:${CONTACT_CONFIG.email}` },
  { icon: '📍', label: 'آدرس', value: 'تهران، خیابان نیاوران، خیابان کامرانیه جنوبی، پلاک ۳۸' },
  { icon: '🕐', label: 'ساعات کاری', value: 'شنبه تا چهارشنبه ۹ الی ۱۸ / پنجشنبه ۹ الی ۱۴' },
]

const emptyForm = { name: '', phone: '', email: '', subject: '', message: '' }

function buildMessage(form) {
  return [
    'سلام، از طریق فرم تماس سایت آکوا پرو پیام می‌دهم:',
    '',
    `👤 نام: ${form.name}`,
    `📱 شماره تماس: ${form.phone}`,
    form.email ? `📧 ایمیل: ${form.email}` : '',
    `📌 موضوع: ${form.subject}`,
    '',
    `💬 پیام: ${form.message}`,
  ]
    .filter(Boolean)
    .join('\n')
}

function ContactPage() {
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('idle')
  const [copied, setCopied] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const message = buildMessage(form)
    const url = `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    setStatus('sent')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildMessage(form))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  function handleReset() {
    setForm(emptyForm)
    setStatus('idle')
    setCopied(false)
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
            {status === 'sent' ? (
              <div className="contact-success">
                <div className="success-icon">✅</div>
                <h4>پیام شما آماده ارسال شد</h4>
                <p>
                  گفتگوی واتس‌اپ با متن پیام شما باز شد؛ کافیست دکمه‌ی ارسال را بزنید. اگر واتس‌اپ باز نشد،
                  از گزینه‌های زیر استفاده کنید.
                </p>
                <div className="contact-actions">
                  <button className="btn btn-primary" onClick={handleCopy}>
                    {copied ? '✓ متن پیام کپی شد' : 'کپی متن پیام'}
                  </button>
                  <a
                    className="btn btn-outline"
                    href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(buildMessage(form))}`}
                  >
                    ارسال از طریق ایمیل
                  </a>
                </div>
                <button className="btn btn-link" onClick={handleReset}>ارسال پیام جدید</button>
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
                    <input type="tel" name="phone" required pattern="[0-9۰-۹\+()\s-]+" value={form.phone} onChange={handleChange} placeholder="مثلاً ۰۹۱۲۳۴۵۶۷۸۹" />
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
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                  ارسال پیام از طریق واتس‌اپ
                </button>
                <p className="contact-note">با ارسال فرم، گفتگوی واتس‌اپ با متن پیام شما باز می‌شود.</p>
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
