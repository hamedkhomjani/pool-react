import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CONTACT_CONFIG } from '../config/contact'
import { track } from '../utils/track'

function ConsultationModal({ open, onClose }) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [poolType, setPoolType] = useState('residential')
  const [notes, setNotes] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  function handleSubmit(e) {
    e.preventDefault()
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setError(t('contact.phoneRequired'))
      return
    }
    setError('')
    setSubmitted(true)
    track('consultation_request', { name, phone, poolType, notes })
  }

  function handleReset() {
    setName('')
    setPhone('')
    setNotes('')
    setSubmitted(false)
    setError('')
    onClose()
  }

  const rawPhone = CONTACT_CONFIG.phone.replace(/\D/g, '')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content consultation-modal-content"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="consultation-modal-title"
      >
        <button className="modal-close" onClick={onClose} aria-label={t('consultation.closeBtn')}>
          ✕
        </button>

        {!submitted ? (
          <>
            <div className="consultation-modal-header">
              <div className="consultation-badge-icon">📞</div>
              <h3 id="consultation-modal-title">{t('consultation.title')}</h3>
              <p>{t('consultation.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="consultation-form">
              {error && <div className="consultation-error-box">{error}</div>}

              <div className="consultation-field">
                <label htmlFor="consultation-name">{t('consultation.nameLabel')}</label>
                <input
                  id="consultation-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={t('consultation.namePlaceholder')}
                />
              </div>

              <div className="consultation-field">
                <label htmlFor="consultation-phone">
                  {t('consultation.phoneLabel')} <span className="req-star">*</span>
                </label>
                <input
                  id="consultation-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder={t('consultation.phonePlaceholder')}
                />
              </div>

              <div className="consultation-field">
                <label htmlFor="consultation-type">{t('consultation.typeLabel')}</label>
                <select
                  id="consultation-type"
                  value={poolType}
                  onChange={e => setPoolType(e.target.value)}
                >
                  <option value="residential">{t('consultation.typeOptions.residential')}</option>
                  <option value="public">{t('consultation.typeOptions.public')}</option>
                  <option value="jacuzzi">{t('consultation.typeOptions.jacuzzi')}</option>
                  <option value="industrial">{t('consultation.typeOptions.industrial')}</option>
                </select>
              </div>

              <div className="consultation-field">
                <label htmlFor="consultation-notes">{t('consultation.notesLabel')}</label>
                <textarea
                  id="consultation-notes"
                  rows="3"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t('consultation.notesPlaceholder')}
                />
              </div>

              <button type="submit" className="btn btn-primary consultation-submit-btn">
                {t('consultation.submitBtn')}
              </button>
            </form>
          </>
        ) : (
          <div className="consultation-success-view">
            <div className="consultation-success-icon">✅</div>
            <h3>{t('consultation.successTitle')}</h3>
            <p>{t('consultation.successSubtitle')}</p>

            <div className="consultation-direct-options">
              <span>{t('consultation.directCall')}</span>
              <a href={`tel:${rawPhone}`} className="consultation-phone-link">
                📞 {CONTACT_CONFIG.phone}
              </a>
              <a
                href={CONTACT_CONFIG.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="consultation-whatsapp-link"
              >
                💬 {t('consultation.whatsappBtn')}
              </a>
            </div>

            <button onClick={handleReset} className="btn btn-outline consultation-close-btn">
              {t('consultation.closeBtn')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConsultationModal
