const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class ValidationError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'ValidationError'
    this.status = status
  }
}

export function cleanString(value, label, { min = 1, max = 200, optional = false } = {}) {
  if ((value === undefined || value === null || value === '') && optional) return null
  if (typeof value !== 'string') throw new ValidationError(`${label} is required.`)
  const cleaned = value.trim().replace(/\s+/g, ' ')
  if (cleaned.length < min) throw new ValidationError(`${label} is required.`)
  if (cleaned.length > max) throw new ValidationError(`${label} must be ${max} characters or fewer.`)
  return cleaned
}

export function cleanEmail(value) {
  const email = cleanString(value, 'Email', { min: 5, max: 254 }).toLowerCase()
  if (!emailPattern.test(email)) throw new ValidationError('Enter a valid email address.')
  return email
}

export function cleanInteger(value, label, { min = 1, max = 500, allowed } = {}) {
  const integer = Number(value)
  if (!Number.isInteger(integer) || integer < min || integer > max) {
    throw new ValidationError(`${label} must be between ${min} and ${max}.`)
  }
  if (allowed && !allowed.includes(integer)) throw new ValidationError(`Choose a valid ${label.toLowerCase()}.`)
  return integer
}

export function normaliseLocation(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function extractPostcodeArea(value = '') {
  const compact = value.trim().toUpperCase().replace(/\s+/g, '')
  const match = compact.match(/^([A-Z]{1,2}\d[A-Z\d]?)(?=\d[A-Z]{2}$|$)/)
  return match?.[1] || null
}

export function extractPostcodeAreaFromAddress(value = '') {
  const match = value.toUpperCase().match(/\b([A-Z]{1,2}\d[A-Z\d]?)\s*\d[A-Z]{2}\b/)
  return match?.[1] || null
}

export function requireConsent(value, message) {
  if (value !== true) throw new ValidationError(message || 'Consent is required.')
  return true
}

export function rejectHoneypot(value) {
  return typeof value === 'string' && value.trim().length > 0
}

export function cleanUuid(value, label = 'Identifier') {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new ValidationError(`${label} is invalid.`)
  }
  return value
}
