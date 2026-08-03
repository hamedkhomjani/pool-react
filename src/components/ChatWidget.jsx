import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const CONTACT_CONFIG = {
  whatsappNumber: '989123456789',
  phone: '+982188888888',
}

const CHAT_API_URL = '/api/chat'

function formatLinks(text) {
  const parts = String(text).split(/(https?:\/\/[^\s]+)/g)
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
    ) : (
      part
    ),
  )
}

function Message({ role, children }) {
  return (
    <div className={`chat-msg chat-${role}`}>
      {role === 'bot' && <span className="chat-avatar">🤖</span>}
      <div className="chat-bubble">{children}</div>
    </div>
  )
}

function ChatWidget() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [init, setInit] = useState(false)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open && !init) {
      setInit(true)
      setMessages([
        { role: 'bot', text: t('chatbot.greeting'), sources: [] },
      ])
    }
  }, [open, init, t])

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages, loading, open])

  async function send(text) {
    const message = (text || input).trim()
    if (!message || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: message, sources: [] }])
    setLoading(true)
    try {
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      const answer = data.answer || t('chatbot.botError')
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: answer, sources: data.sources || [] },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: t('chatbot.botError'), sources: [] },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const waUrl = `https://wa.me/${CONTACT_CONFIG.whatsappNumber}?text=${encodeURIComponent(t('footer.shareText'))}`

  return (
    <>
      {open && (
        <div className="chat-widget" role="dialog" aria-label={t('chatbot.label')}>
          <div className="chat-header">
            <span className="chat-avatar">🤖</span>
            <div className="chat-header-text">
              <strong>{t('chatbot.label')}</strong>
              <span className="chat-status">● {t('chatbot.placeholder')}</span>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label={t('chatbot.close')}>✕</button>
          </div>
          <div className="chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <Message key={i} role={m.role}>
                {formatLinks(m.text)}
                {m.sources.length > 0 && (
                  <div className="chat-sources">
                    {m.sources.slice(0, 2).map((s, j) => (
                      <span key={j}>{s}</span>
                    ))}
                  </div>
                )}
              </Message>
            ))}
            {loading && (
              <Message role="bot">
                <span className="chat-typing"><i /><i /><i /></span>
              </Message>
            )}
            <div className="chat-disclaimer">{t('chatbot.disclaimer')}</div>
          </div>
          <div className="chat-footer">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chatbot.placeholder')}
              rows={1}
            />
            <button className="chat-send" onClick={() => send()} disabled={loading} aria-label={t('chatbot.send')}>➤</button>
          </div>
          <a className="chat-human" href={waUrl} target="_blank" rel="noopener noreferrer">
            {t('chatbot.human')} · <span className="chat-phone">{t('chatbot.contactPhone')}</span>
          </a>
        </div>
      )}
      <button
        className={`chat-fab ${open ? 'chat-fab-open' : ''}`}
        onClick={() => setOpen(p => !p)}
        aria-label={open ? t('chatbot.close') : t('chatbot.open')}
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  )
}

export default ChatWidget