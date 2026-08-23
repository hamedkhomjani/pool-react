import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { whatsappUrl } from '../config/contact'

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

const API_TIMEOUT = 20000

async function postMessage(message, signal) {
  const res = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
    signal,
  })
  return res.json()
}

function ChatWidget() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([{ role: 'bot', greeting: true }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages, loading, open])

  async function send(text) {
    const message = (text || input).trim()
    if (!message || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: message }])
    setLoading(true)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT)
    try {
      const data = await postMessage(message, controller.signal)
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
      clearTimeout(timer)
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const waUrl = whatsappUrl(t('footer.shareText'))

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
                {m.greeting ? t('chatbot.greeting') : formatLinks(m.text)}
                {m.sources?.length > 0 && (
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