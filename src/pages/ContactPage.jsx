import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Reveal from '../components/Reveal'
import useSeo from '../hooks/useSeo'
import { CONTACT_CONFIG, whatsappUrl } from '../config/contact'
import normalizeDigits from '../utils/digits'

const contactKeys = ['phone', 'mobile', 'email', 'address', 'hours']

const contactHrefs = {
  phone: CONTACT_CONFIG.phoneHref,
  mobile: CONTACT_CONFIG.mobileHref,
  email: `mailto:${CONTACT_CONFIG.email}`,
}

const emptyForm = { name: '', phone: '', email: '', subject: '', message: '' }

function ContactPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState('idle')
  const [copied, setCopied] = useState(false)

  useSeo({
    title: t('meta.contactTitle'),
    description: t('meta.contactDescription'),
    canonical: `${window.location.origin}/contact/`,
  })

  function buildMessage() {
    const phone = normalizeDigits(form.phone)
    const emailLine = form.email ? `${t('contact.messageEmail', { email: form.email })}\n` : ''
    return t('contact.messageTemplate', {
      name: form.name,
      phone,
      email: emailLine,
      subject: form.subject,
      message: form.message,
    })
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const message = buildMessage()
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer')
    setStatus('sent')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildMessage())
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
            <h2>{t('contact.title')}</h2>
            <p>{t('contact.subtitle')}</p>
          </div>
        </Reveal>

        <div className="contact-grid">
          <Reveal direction="right">
            <div className="contact-form-card">
            <h3>{t('contact.formTitle')}</h3>
            {status === 'sent' ? (
              <div className="contact-success">
                <div className="success-icon">✅</div>
                <h4>{t('contact.successTitle')}</h4>
                <p>{t('contact.successText')}</p>
                <div className="contact-actions">
                  <button className="btn btn-primary" onClick={handleCopy}>
                    {copied ? t('contact.copiedBtn') : t('contact.copyBtn')}
                  </button>
                  <a
                    className="btn btn-outline"
                    href={`mailto:${CONTACT_CONFIG.email}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(buildMessage())}`}
                  >
                    {t('contact.emailBtn')}
                  </a>
                </div>
                <button className="btn btn-link" onClick={handleReset}>{t('contact.newMessage')}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('contact.nameLabel')}</label>
                    <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder={t('contact.namePlaceholder')} />
                  </div>
                  <div className="form-group">
                    <label>{t('contact.phoneLabel')}</label>
                    <input type="tel" name="phone" required pattern="[0-9۰-۹\+()\s-]+" value={form.phone} onChange={handleChange} placeholder={t('contact.phonePlaceholder')} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('contact.emailLabel')}</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder={t('contact.emailPlaceholder')} />
                  </div>
                  <div className="form-group">
                    <label>{t('contact.subjectLabel')}</label>
                    <input type="text" name="subject" required value={form.subject} onChange={handleChange} placeholder={t('contact.subjectPlaceholder')} />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('contact.messageLabel')}</label>
                  <textarea name="message" rows="5" required value={form.message} onChange={handleChange} placeholder={t('contact.messagePlaceholder')}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                  {t('contact.submitBtn')}
                </button>
                <p className="contact-note">{t('contact.note')}</p>
              </form>
            )}
            </div>
          </Reveal>

          <Reveal direction="left">
            <div className="contact-info-card">
            <h3>{t('contact.infoTitle')}</h3>
            <div className="contact-list">
              {contactKeys.map((key, i) => (
                <div className="contact-item" key={i}>
                  <div className="contact-item-icon">{['📞', '📱', '📧', '📍', '🕐'][i]}</div>
                  <div>
                    <div className="contact-item-label">{t(`contact.info.${key}`)}</div>
                    {contactHrefs[key] ? (
                      <a href={contactHrefs[key]} className="contact-item-value">{t(`contact.infoValues.${key}`)}</a>
                    ) : (
                      <div className="contact-item-value">{t(`contact.infoValues.${key}`)}</div>
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
            title={t('contact.mapTitle')}
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
