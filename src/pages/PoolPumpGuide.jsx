import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Reveal from '../components/Reveal'
import useSeo from '../hooks/useSeo'
import GuideSizer from '../components/GuideSizer'
import GuideProductCard from '../components/GuideProductCard'
import MobileCtaBar from '../components/MobileCtaBar'
import products from '../data/products'

const siteUrl = 'https://aquapro.ir'

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'راهنمای خرید پمپ استخر در ۱۴۰۵؛ جدول انتخاب اسب بر اساس حجم استخر',
  description:
    'راهنمای کامل خرید پمپ استخر در سال ۱۴۰۵: جدول اسب بر اساس حجم، مصرف برق و مقایسه برندها. مشاوره رایگان: ۰۲۱-۸۸۸۸۸۸۸۸',
  image: `${siteUrl}/image.png`,
  datePublished: '2026-03-21T08:00:00+03:30',
  dateModified: '2026-07-31T08:00:00+03:30',
  inLanguage: 'fa-IR',
  author: {
    '@type': 'Organization',
    name: 'آکوا پرو',
    url: siteUrl,
    telephone: '+982188888888',
    sameAs: [
      'https://www.instagram.com/aquapro.ir',
      'https://t.me/aquapro.ir',
      'https://www.linkedin.com/company/aquapro.ir',
    ],
  },
  publisher: {
    '@type': 'Organization',
    name: 'آکوا پرو',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/favicon.svg`,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${siteUrl}/pool-pump-guide/`,
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'پمپ استخر برای استخر ۵۰ متر مکعبی چند اسب است؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'برای استخر ۵۰ متر مکعبی، پمپ 0.75 تا 1 اسب با دبی ۱۲ تا ۱۶ متر مکعب بر ساعت کافی است تا آب در کمتر از ۶ ساعت یک دور کامل تصفیه شود.',
      },
    },
    {
      '@type': 'Question',
      name: 'هزینه‌ی برق پمپ استخر در ماه چقدر است؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'بستگی به توان پمپ و ساعات کار دارد. یک پمپ ۱.۵ اسب که روزانه ۸ ساعت کار کند، حدود ۲۶۰ تا ۲۷۰ کیلووات‌ساعت در ماه مصرف می‌کند که با پمپ دور متغیر تا ۷۰٪ قابل کاهش است.',
      },
    },
    {
      '@type': 'Question',
      name: 'فرق پمپ دو سرعته و دور متغیر چیست؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'پمپ دو سرعته فقط دو حالت دارد، اما پمپ دور متغیر بین نه مقدار دور را به‌صورت هوشمند انتخاب می‌کند. دور متغیر برای استخرهای پرمصرف تا ۷۰٪ صرفه‌جویی برق دارد ولی قیمت اولیه‌ی بالاتری دارد.',
      },
    },
    {
      '@type': 'Question',
      name: 'عمر مفید پمپ استخر چقدر است؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'با نگهداری صحیح (شست‌وشوی فیلتر، جلوگیری از خشک‌کارکردن و تخلیه در زمستان)، پمپ‌های باکیفیت بین ۸ تا ۱۲ سال عمر می‌کنند.',
      },
    },
    {
      '@type': 'Question',
      name: 'آیا برای استخر آب شور حتماً پمپ ضد اسید لازم است؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'بله. در استخرهای دارای کلرزن نمکی، پمپ با بدنه‌ی استیل ۳۰۴ و سیل ضد اسید ضروری است؛ در غیر این صورت قطعات فلزی در کمتر از دو سال دچار خوردگی می‌شوند.',
      },
    },
    {
      '@type': 'Question',
      name: 'هر چند وقت یک‌بار باید پمپ استخر تعویض شود؟',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'اگر پمپ شما صدای غیرعادی می‌دهد، دبی آن افت کرده یا در کیسینگ ترک ایجاد شده، زمان تعویض فرا رسیده است. بازرسی سالانه توسط کارشناس قبل از شروع فصل شنا توصیه می‌شود.',
      },
    },
  ],
}

const combinedSchema = {
  '@context': 'https://schema.org',
  '@graph': [articleSchema, faqSchema],
}

const sizingRows = [
  { volume: 'تا ۳۰', hp: '0.5 HP', flow: '8 m³/h', model: 'HW-0500' },
  { volume: '۳۰ تا ۵۰', hp: '0.75 HP', flow: '12 m³/h', model: 'HW-0750' },
  { volume: '۵۰ تا ۸۰', hp: '1 HP', flow: '16 m³/h', model: 'HW-1000' },
  { volume: '۸۰ تا ۱۲۰', hp: '1.5 HP', flow: '21 m³/h', model: 'HW-1500' },
  { volume: '۱۲۰ تا ۲۰۰', hp: '2 HP', flow: '28 m³/h', model: 'HW-2000' },
  { volume: 'بیش از ۲۰۰', hp: '3 HP', flow: '35 m³/h', model: 'HW-3000' },
]

const pumpTypes = [
  {
    icon: '⚡',
    title: 'پمپ تک‌سرعته',
    desc: 'ساده‌ترین و اقتصادی‌ترین نوع برای خرید اولیه. همیشه با دور و توان کامل کار می‌کند؛ گزینه‌ای منطقی برای استخرهای کوچک خانگی.',
  },
  {
    icon: '🔁',
    title: 'پمپ دو سرعته',
    desc: 'دو حالت عادی و کم‌مصرف دارد. گردش روزانه را در دور پایین انجام می‌دهید (تا ۵۰٪ صرفه‌جویی برق) و برای پمپاژ کف یا شست‌وشوی فیلتر دور بالا می‌روید.',
  },
  {
    icon: '🎛️',
    title: 'پمپ دور متغیر',
    desc: 'گران‌ترین و به‌صرفه‌ترین گزینه در بلندمدت. دور موتور هوشمند تنظیم می‌شود و در کارکرد بالای ۸ ساعت روزانه، مصرف برق را تا ۷۰٪ کاهش می‌دهد.',
  },
]

const faqItems = [
  {
    q: 'پمپ استخر برای استخر ۵۰ متر مکعبی چند اسب است؟',
    a: 'برای استخر ۵۰ متر مکعبی، پمپ 0.75 تا 1 اسب با دبی ۱۲ تا ۱۶ متر مکعب بر ساعت کافی است تا آب در کمتر از ۶ ساعت یک دور کامل تصفیه شود.',
  },
  {
    q: 'هزینه‌ی برق پمپ استخر در ماه چقدر است؟',
    a: 'بستگی به توان پمپ و ساعات کار دارد. یک پمپ ۱.۵ اسب که روزانه ۸ ساعت کار کند، حدود ۲۶۰ تا ۲۷۰ کیلووات‌ساعت در ماه مصرف می‌کند که با پمپ دور متغیر تا ۷۰٪ قابل کاهش است.',
  },
  {
    q: 'فرق پمپ دو سرعته و دور متغیر چیست؟',
    a: 'پمپ دو سرعته فقط دو حالت دارد، اما پمپ دور متغیر بین نه مقدار دور را به‌صورت هوشمند انتخاب می‌کند. دور متغیر برای استخرهای پرمصرف تا ۷۰٪ صرفه‌جویی برق دارد ولی قیمت اولیه‌ی بالاتری دارد.',
  },
  {
    q: 'عمر مفید پمپ استخر چقدر است؟',
    a: 'با نگهداری صحیح (شست‌وشوی فیلتر، جلوگیری از خشک‌کارکردن و تخلیه در زمستان)، پمپ‌های باکیفیت بین ۸ تا ۱۲ سال عمر می‌کنند.',
  },
  {
    q: 'آیا برای استخر آب شور حتماً پمپ ضد اسید لازم است؟',
    a: 'بله. در استخرهای دارای کلرزن نمکی، پمپ با بدنه‌ی استیل ۳۰۴ و سیل ضد اسید ضروری است؛ در غیر این صورت قطعات فلزی در کمتر از دو سال دچار خوردگی می‌شوند.',
  },
  {
    q: 'هر چند وقت یک‌بار باید پمپ استخر تعویض شود؟',
    a: 'اگر پمپ شما صدای غیرعادی می‌دهد، دبی آن افت کرده یا در کیسینگ ترک ایجاد شده، زمان تعویض فرا رسیده است. بازرسی سالانه توسط کارشناس قبل از شروع فصل شنا توصیه می‌شود.',
  },
]

const featuredPump = products.find(p => p.category === 'pump')
const featuredFilter = products.find(p => p.category === 'filter')
const featuredDisinfection = products.find(p => p.category === 'disinfection')

function CalculatorLink({ children }) {
  const navigate = useNavigate()
  return (
    <a
      href="/#calculator"
      className="guide-inline-link"
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

function FAQItem({ q, a, open, onToggle }) {
  return (
    <div className={`guide-faq-item ${open ? 'open' : ''}`}>
      <button className="guide-faq-q" onClick={onToggle} aria-expanded={open}>
        <span>{q}</span>
        <span className="guide-faq-icon" aria-hidden="true">▾</span>
      </button>
      <div className="guide-faq-a">
        <p>{a}</p>
      </div>
    </div>
  )
}

function PoolPumpGuide() {
  const [openFaq, setOpenFaq] = useState(null)

  useSeo({
    title: 'راهنمای خرید پمپ استخر [۱۴۰۵]؛ جدول انتخاب اسب بر اساس حجم',
    description:
      'راهنمای کامل خرید پمپ استخر در سال ۱۴۰۵: جدول اسب بر اساس حجم، مصرف برق و مقایسه برندها. مشاوره رایگان: ۰۲۱-۸۸۸۸۸۸۸۸',
    canonical: `${window.location.origin}/pool-pump-guide/`,
    jsonLd: combinedSchema,
  })

  return (
    <section className="guide-page">
      <div className="container">
        <Reveal>
          <header className="guide-header">
            <span className="guide-badge">راهنمای خرید تخصصی</span>
            <h1>راهنمای خرید پمپ استخر در ۱۴۰۵؛ جدول انتخاب اسب بر اساس حجم استخر</h1>
            <p className="guide-meta">
              تیم فنی آکوا پرو · به‌روزرسانی: سال ۱۴۰۵ · مطالعه در ۸ دقیقه
            </p>
          </header>
        </Reveal>

        <Reveal>
          <p className="guide-lead">
            انتخاب پمپ استخر اشتباه یعنی حداقل ۳۰٪ بیشتر قبض برق، صدای مزاحم در حیاط و آبی که با هر بار
            وزش باد، سطحش را با برگ درختان می‌پوشاند؛ در حالی که با انتخاب درست، همه‌چیز بی‌صدا و خودکار
            کار می‌کند. ما در آکوا پرو در ۱۵ سال گذشته بیش از ۱,۲۰۰ پروژه‌ی استخر خانگی و ویلایی را اجرا
            کرده‌ایم و در این راهنما، به زبان ساده و فقط با اعداد واقعی به شما می‌گوییم پمپی که دقیقاً
            برای حجم استخر شما ساخته شده چه مشخصاتی دارد — بدون اصطلاحات پیچیده‌ی بازاریابی.
          </p>
        </Reveal>

        <Reveal>
          <aside className="guide-author">
            <div className="guide-author-avatar">💧</div>
            <div className="guide-author-body">
              <div className="guide-author-verify">
                <span className="guide-author-verify-icon">✓</span>
                بررسی تخصصی و تایید شده توسط تیم فنی آکوا پرو
              </div>
              <p className="guide-author-text">
                این مقاله بر اساس بیش از ۱۵ سال تجربه‌ی اجرایی و داده‌های بیش از ۱,۲۰۰ پروژه‌ی استخر خانگی و
                ویلایی تهیه شده است. تیم فنی ما پیش از انتشار، تمام جدول‌ها و توصیه‌ها را با استانداردهای
                روز صنعت تطبیق داده است.
              </p>
              <div className="guide-author-meta">
                <span>به‌روزرسانی: مرداد ۱۴۰۵</span>
                <span>زمان مطالعه: ۸ دقیقه</span>
              </div>
            </div>
          </aside>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>چرا انتخاب درست پمپ استخر مهم است؟</h2>
            <p className="guide-p">
              پمپ قلب مدار گردش آب استخر است. آب از طریق اسکیمر به پمپ می‌رسد، از فیلتر شنی عبور می‌کند و
              دوباره به استخر برمی‌گردد. اگر پمپ ضعیف باشد، آب زلال نمی‌شود و باکتری و جلبک فرصت رشد پیدا
              می‌کنند. اگر پمپ بیش‌ازحد قوی باشد، نه‌تنها هزینه‌ی برق شما چند برابر می‌شود، بلکه به
              لوله‌کشی و فیلتر هم فشار می‌آورد.
            </p>
            <h3>هزینه‌های پنهان انتخاب اشتباه</h3>
            <ul className="guide-list">
              <li><strong>قبض برق:</strong> پمپ ۲ اسب در مقایسه با پمپ ۱ اسب برای همان استخر، سالانه حدود ۴ تا ۶ میلیون تومان بیشتر هزینه‌ی برق دارد.</li>
              <li><strong>استهلاک زودرس:</strong> پمپ بزرگ‌تر از نیاز، مدام روشن‌وخاموش می‌شود و سیل‌های آن زودتر فرسوده می‌شوند.</li>
              <li><strong>شیرآلات و لوله‌ها:</strong> فشار زیاد به مرور اتصالات را شل و نشت می‌کند.</li>
            </ul>
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>آشنایی با انواع پمپ استخر</h2>
            <p className="guide-p">پمپ‌ها بر اساس نوع موتور به سه دسته تقسیم می‌شوند:</p>
            <div className="guide-grid guide-grid-3">
              {pumpTypes.map((t, i) => (
                <div className="guide-card" key={i}>
                  <div className="guide-card-icon">{t.icon}</div>
                  <h3>{t.title}</h3>
                  <p>{t.desc}</p>
                </div>
              ))}
            </div>
            <div className="guide-tip">
              <strong>نکته‌ی تخصصی:</strong> اگر استخر شما با سیستم کلرزن نمکی کار می‌کند، حتماً پمپی با برس
              و سیل ضد اسید و بدنه‌ی استیل ۳۰۴ انتخاب کنید تا در برابر خوردگی آب شور مقاوم باشد.
            </div>
            <div className="guide-protip">
              <span className="guide-protip-icon">🛠️</span>
              <div>
                <strong>نکته از میدان (تجربه ۱۵ ساله):</strong> در بیش از ۳۰٪ پروژه‌هایی که به‌خاطر
                «آب‌روی جلبک‌دار» به ما مراجعه شد، مشکل پمپ نبود؛ لوله‌کشیِ طولانی‌تر از ۱۵ متر و چند زانویی
                ۹۰ درجه، دبی را عملاً ۴۰٪ پایین آورده بود. اگر استخر شما این ویژگی را دارد، یک پله بالاتر از
                جدول زیر را انتخاب کنید.
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>پمپ استخر چند اسب نیاز دارم؟</h2>
            <p className="guide-p">
              ابتدا حجم استخر را محاسبه کنید. برای استخر مستطیلی: <strong>طول × عرض × عمق متوسط</strong>{' '}
              به متر مکعب. برای استخر دایره‌ای: <strong>۳.۱۴ × (شعاع × شعاع) × عمق</strong>. اگر مطمئن
              نیستید، از <CalculatorLink>محاسبه‌گر تجهیزات استخر</CalculatorLink> ما استفاده کنید.
            </p>

            <div className="guide-table-wrap">
              <table className="guide-table">
                <thead>
                  <tr>
                    <th>حجم استخر (متر مکعب)</th>
                    <th>اسب بخار پیشنهادی</th>
                    <th>دبی پیشنهادی</th>
                    <th>نمونه مدل</th>
                  </tr>
                </thead>
                <tbody>
                  {sizingRows.map((row, i) => (
                    <tr key={i}>
                      <td>{row.volume}</td>
                      <td>{row.hp}</td>
                      <td>{row.flow}</td>
                      <td><span className="guide-model">{row.model}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <GuideSizer />

            {featuredPump && featuredFilter && (
              <div className="guide-products">
                <h3>پیشنهاد تیم فنی برای استخرهای ۸۰ تا ۱۲۰ متر مکعب</h3>
                <div className="guide-product-grid">
                  <GuideProductCard product={featuredPump} />
                  <GuideProductCard product={featuredFilter} />
                </div>
              </div>
            )}

            <h3>تأثیر لوله‌کشی و فاصله بر انتخاب شما</h3>
            <p className="guide-p">
              هر ۱۰ متر طول لوله‌کشی و هر زانویی ۹۰ درجه، عملاً ۱ تا ۱.۵ متر از ارتفاع مکش پمپ را می‌گیرد.
              اگر اتاق تکنیکال شما بیشتر از ۱۵ متر با استخر فاصله دارد یا مسیر لوله‌کشی پر از انشعاب است،
              یک پله بالاتر از جدول انتخاب کنید.
            </p>
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>مشخصات فنی که قبل از خرید باید بدانید</h2>
            <div className="guide-grid guide-grid-2">
              <div className="guide-card">
                <h3>دبی و هد پمپ</h3>
                <p>
                  دبی یعنی حجم آبی که پمپ در ساعت جابه‌جا می‌کند (m³/h) و هد یعنی ارتفاعی که می‌تواند آب را
                  بالا ببرد (متر). قانون طلایی: کل حجم استخر باید در حدود ۶ ساعت یک‌بار به‌طور کامل از فیلتر
                  عبور کند.
                </p>
              </div>
              <div className="guide-card">
                <h3>مصرف برق و هزینه‌ی سالانه</h3>
                <p>
                  برای محاسبه‌ی تقریبی: <strong>توان به وات × ساعات کار روزانه × ۳۰ ÷ ۱۰۰۰</strong>. مثلاً
                  پمپ ۱.۵ اسب (حدود ۱۱۰۰ وات) با ۸ ساعت کار روزانه، ماهانه حدود ۲۶۴ کیلووات‌ساعت مصرف
                  می‌کند.
                </p>
              </div>
              <div className="guide-card">
                <h3>جنس بدنه</h3>
                <p>
                  <strong>استیل ۳۰۴</strong> ضد زنگ و مقاوم در برابر مواد شیمیایی و آب شور است؛ پیشنهاد ما
                  برای هر نوع استخری. پلاستیک و پلی‌اتیلن ارزان‌تر و بی‌صداترند اما در برابر UV و مواد
                  شیمیایی عمر کمتری دارند.
                </p>
              </div>
              <div className="guide-card">
                <h3>سطح صدا و گارانتی</h3>
                <p>
                  پمپ‌های باکیفیت زیر ۴۵ دسی‌بل کار می‌کنند. حتماً گارانتی واقعی و مکتوب (ترجیحاً بالای ۱۸
                  ماه) و شبکه‌ی خدمات پس از فروش معتبر را چک کنید.
                </p>
              </div>
            </div>
            <div className="guide-protip">
              <span className="guide-protip-icon">❄️</span>
              <div>
                <strong>نکته‌ی اجرایی زمستان:</strong> پمپ‌های خشک‌کارکرده بعد از هر زمستان، عامل اصلی
                تعویض سیل و درین ژولت در مراجعات سالانه‌ی ما هستند. پیش از اولین یخبندان، آب داخل کیسینگ و
                ورودی پمپ را کامل تخلیه کنید و درب اسکیمر را ببندید.
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>بهترین برندهای پمپ استخر در بازار ایران</h2>
            <div className="guide-brands">
              <div className="guide-brand">
                <span className="guide-brand-name">هایواتر</span>
                <p>محبوب‌ترین برند بازار برای استخرهای خانگی و ویلایی؛ بدنه‌ی استیل ۳۰۴، پشتیبانی گسترده و بیشترین تنوع از 0.5 تا 3 اسب.</p>
              </div>
              <div className="guide-brand">
                <span className="guide-brand-name">ایمکس</span>
                <p>گزینه‌ی مطمئن برای استخرهای بزرگ‌تر و پروژه‌های عمومی؛ با فیلترهای شنی هم‌خانواده‌ی خودش بهترین هماهنگی را دارد.</p>
              </div>
              <div className="guide-brand">
                <span className="guide-brand-name">برندهای اروپایی</span>
                <p>کیفیت و قیمت بالاتر؛ مناسب ویلاهای لوکس و پروژه‌هایی که بودجه‌ی بالاتری دارند.</p>
              </div>
            </div>
            <p className="guide-p">
              برای مقایسه‌ی قیمت روز هر برند در سال ۱۴۰۵، به{' '}
              <Link to="/category/pump" className="guide-inline-link">صفحه‌ی پمپ استخر</Link> مراجعه کنید.
            </p>
            {featuredDisinfection && (
              <div className="guide-products">
                <h3>تکمیل مدار با پکیج ضدعفونی</h3>
                <div className="guide-product-grid">
                  <GuideProductCard product={featuredDisinfection} />
                </div>
              </div>
            )}
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>تفاوت پمپ، فیلتر و مبدل حرارتی</h2>
            <p className="guide-p">
              پمپ وظیفه‌ی <strong>گردش</strong> آب را دارد، فیلتر شنی وظیفه‌ی <strong>تصفیه</strong> (گرفتن
              ذرات معلق) و مبدل حرارتی وظیفه‌ی <strong>گرمایش</strong> آب. انتخاب پمپ قوی‌تر هیچ‌کدام از این
              دو را جبران نمی‌کند. پیشنهاد تیم فنی ما: پمپ و فیلتر را همیشه یک‌جا و هم‌اندازه بخرید.
            </p>
            <div className="guide-cluster">
              <Link to="/category/pump" className="guide-cluster-link">
                <span className="guide-cluster-icon">⚙️</span>
                <div>
                  <h3>پمپ تصفیه استخر</h3>
                  <p>مشاهده مدل‌های پرفروش و قیمت روز</p>
                </div>
                <span className="guide-cluster-arrow">←</span>
              </Link>
              <Link to="/category/filter" className="guide-cluster-link">
                <span className="guide-cluster-icon">🌪️</span>
                <div>
                  <h3>فیلتر شنی مناسب پمپ شما</h3>
                  <p>مشاهده فیلترهای هم‌اندازه با پمپ</p>
                </div>
                <span className="guide-cluster-arrow">←</span>
              </Link>
              <Link to="/category/heater" className="guide-cluster-link">
                <span className="guide-cluster-icon">🔥</span>
                <div>
                  <h3>مبدل حرارتی تیتانیومی</h3>
                  <p>مشاهده گرمایش استخرهای خانگی و ویلایی</p>
                </div>
                <span className="guide-cluster-arrow">←</span>
              </Link>
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-section">
            <h2>سوالات متداول درباره پمپ استخر</h2>
            <div className="guide-faq">
              {faqItems.map((item, i) => (
                <FAQItem
                  key={i}
                  q={item.q}
                  a={item.a}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="guide-cta">
            <h2>جمع‌بندی و راهنمای انتخاب نهایی</h2>
            <p>
              با سه عدد، انتخاب پمپ تمام می‌شود: <strong>حجم استخر را محاسبه کنید، اسب بخار را از جدول
              بردارید و به‌جای برند، بدنه‌ی استیل ۳۰۴ و گارانتی مکتوب را چک کنید.</strong> اگر هنوز مطمئن
              نیستید یا ابعاد استخر شما غیرمعمول است، کارشناسان آکوا پرو به‌صورت رایگان با شما مشورت
              می‌کنند تا بهترین پمپ را برای همان هزینه‌ای که قصد پرداخت داشتید، بخرید.
            </p>
            <div className="guide-cta-btns">
              <Link to="/category/pump" className="btn btn-primary">مشاهده پمپ‌های استخر</Link>
              <Link to="/" className="btn btn-outline">محاسبه تجهیزات استخر من</Link>
            </div>
            <div className="guide-cta-contact">
              <span>📞 مشاوره رایگان و قیمت روز: ۰۲۱-۸۸۸۸۸۸۸۸</span>
              <span>📱 موبایل و واتس‌اپ: ۰۹۱۲-۳۴۵-۶۷۸۹</span>
            </div>
          </section>
        </Reveal>
      </div>
      <MobileCtaBar />
    </section>
  )
}

export default PoolPumpGuide
