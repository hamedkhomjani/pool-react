import { Link } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { CONTACT_CONFIG } from '../config/contact'
import { SITE_URL } from '../config/site'
import CalculatorLink from './CalculatorLink'

function Footer() {
  const { t } = useTranslation()
  const shareUrl = SITE_URL
  const shareText = t('footer.shareText')

  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <div className="logo" style={{ color: '#F1F5F9' }}>
              <div className="logo-icon">💧</div>
              <span>{t('brand')}</span>
            </div>
            <p>{t('footer.aboutText')}</p>
          </div>
          <div className="footer-col">
            <h4>{t('footer.equipmentTitle')}</h4>
            <ul>
              <li><Link to="/category/pump">{t('footer.equipment.pumps')}</Link></li>
              <li><Link to="/category/filter">{t('footer.equipment.filters')}</Link></li>
              <li><Link to="/category/heater">{t('footer.equipment.heaters')}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t('footer.servicesTitle')}</h4>
            <ul>
              <li><Link to="/guides">{t('footer.services.guides')}</Link></li>
              <li><Link to="/pool-pump-guide">{t('footer.services.guide')}</Link></li>
              <li><CalculatorLink className="">{t('footer.services.calculator')}</CalculatorLink></li>
              <li><Link to="/contact">{t('footer.services.consulting')}</Link></li>
              <li><Link to="/contact">{t('footer.services.warranty')}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t('footer.contactTitle')}</h4>
            <ul>
              <li><a href={CONTACT_CONFIG.phoneHref}>{t('footer.contactPhone')}</a></li>
              <li><Link to="/contact">{t('footer.contactAddress')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-share">
          <span>{t('footer.shareTitle')}</span>
          <div className="share-buttons">
            <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="share-btn telegram" title="Telegram">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </a>
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="share-btn whatsapp" title="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
            <a href="https://www.instagram.com/aquapro.ir" target="_blank" rel="noopener noreferrer" className="share-btn instagram" title="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="share-btn linkedin" title="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href={`https://web.bale.ai/share?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="share-btn bale" title="Bale">
              <svg viewBox="0 0 200 200" fill="currentColor"><path d="M100 0C44.77 0 0 44.77 0 100s44.77 100 100 100 100-44.77 100-100S155.23 0 100 0zm0 185.71c-47.28 0-85.71-38.43-85.71-85.71S52.72 14.29 100 14.29s85.71 38.43 85.71 85.71-38.43 85.71-85.71 85.71zm-10.71-60.72l-14.29 14.29-14.28-14.29 14.28-14.28 14.29 14.28zm35.71-50l-14.28 14.29-14.29-14.29 14.29-14.28 14.28 14.28zm-60.72 7.14l14.29-14.28 14.28 14.28-14.28 14.29-14.29-14.29zm64.28 0l14.29 14.29-14.29 14.28-14.28-14.28 14.28-14.29z"/></svg>
            </a>
          </div>
        </div>

        <div className="copyright">
          <Trans i18nKey="footer.copyright">
            <a href="https://www.linkedin.com/in/hamed-khomjani" target="_blank" rel="noopener noreferrer">Hamed Khomjani</a>
          </Trans>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
