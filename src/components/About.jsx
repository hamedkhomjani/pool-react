const stats = [
  { number: '۱,۲۰۰+', label: 'پروژه موفق' },
  { number: '۱۵+', label: 'سال تجربه' },
  { number: '۸۰+', label: 'شهر تحت پوشش' },
  { number: '۹۸٪', label: 'رضایت مشتری' },
]

const values = [
  { icon: '✅', title: 'اصالت کالا', desc: 'همه تجهیزات به صورت مستقیم از برندهای معتبر جهانی با ضمانت اصالت تامین می‌شوند.' },
  { icon: '🔧', title: 'نصب حرفه‌ای', desc: 'تیم فنی مجرب ما نصب و راه‌اندازی تجهیزات را در سراسر کشور انجام می‌دهد.' },
  { icon: '📞', title: 'پشتیبانی دائمی', desc: 'پس از فروش هم همراه شما هستیم. مشاوره، گارانتی و خدمات پس از فروش.' },
  { icon: '🧾', title: 'تضمین قیمت', desc: 'بهترین قیمت بازار با ضمانت بازگشت وجه در صورت عدم رضایت.' },
]

import Reveal from './Reveal'

function About() {
  return (
    <section className="about-section" id="about">
      <div className="container">
        <Reveal>
          <div className="section-header">
            <h2>درباره آکوا پرو</h2>
            <p>پیشرو در تامین تجهیزات مدرن استخر و جکوزی در ایران</p>
          </div>
        </Reveal>

        <div className="about-content">
          <Reveal direction="right">
            <div className="about-text">
              <p>آکوا پرو از سال ۱۳۹۰ فعالیت خود را در زمینه تامین و پشتیبانی تجهیزات استخر و جکوزی آغاز کرده است. ما با بهره‌گیری از دانش فنی روز دنیا و همکاری با برترین برندهای بین‌المللی، راهکارهای جامعی برای تصفیه، گرمایش، ضدعفونی و نگهداری استخر ارائه می‌دهیم.</p>
              <p>هدف ما ایجاد شفافیت در بازار تجهیزات استخر است. تمامی محصولات به صورت دقیق مشخصات فنی، گارانتی معتبر و قیمت واقعی دارند تا شما بتوانید با آگاهی کامل بهترین انتخاب را داشته باشید.</p>
            </div>
          </Reveal>
          <Reveal direction="left">
            <div className="about-stats">
              {stats.map((stat, i) => (
                <div className="stat-card" key={i}>
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="about-values">
          {values.map((v, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h4>{v.title}</h4>
                <p>{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default About
