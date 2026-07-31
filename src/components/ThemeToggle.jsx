function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'فعال‌سازی حالت روشن' : 'فعال‌سازی حالت تاریک'}
      title={isDark ? 'حالت روشن' : 'حالت تاریک'}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle
