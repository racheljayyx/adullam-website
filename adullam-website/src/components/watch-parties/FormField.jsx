function FormField({
  label,
  name,
  hint,
  error,
  children,
  required = false,
}) {
  const hintId = hint ? `${name}-hint` : undefined
  const errorId = error ? `${name}-error` : undefined

  return (
    <div>
      <label htmlFor={name} className='block text-sm font-semibold text-black'>
        {label}
        {required && <span className='ml-1 text-[#7D5E48]' aria-hidden='true'>*</span>}
      </label>
      {hint && (
        <p id={hintId} className='mt-1 text-xs leading-5 text-black/55'>
          {hint}
        </p>
      )}
      <div className='mt-2'>{children}</div>
      {error && (
        <p id={errorId} className='mt-2 text-sm text-red-700' role='alert'>
          {error}
        </p>
      )}
    </div>
  )
}

export const fieldClassName =
  'w-full rounded-xl border border-black/20 bg-white px-4 py-3 text-base text-black outline-none transition placeholder:text-black/35 focus:border-black focus:ring-2 focus:ring-[#C0AA95]/35 disabled:cursor-not-allowed disabled:bg-black/5'

export default FormField

