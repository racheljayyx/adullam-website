const styles = {
  error: 'border-red-200 bg-red-50 text-red-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  info: 'border-[#C0AA95]/45 bg-white text-black/75',
}

function InlineNotice({ children, tone = 'info' }) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm leading-6 ${styles[tone]}`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

export default InlineNotice

