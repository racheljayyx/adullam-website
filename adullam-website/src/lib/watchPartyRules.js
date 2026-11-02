export const radiusOptions = [5, 10, 25, 50]

const ukPostcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/

export function normaliseUkPostcode(value = '') {
  const compact = value.trim().toUpperCase().replace(/\s+/g, '')
  if (!ukPostcodePattern.test(compact)) return ''
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`
}

export function validateUkPostcode(value = '') {
  return normaliseUkPostcode(value) ? '' : "We couldn't recognise that postcode. Please check it and try again."
}

export function normaliseLocation(value = '') {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

export function postcodeArea(value = '') {
  const compact = value.trim().toUpperCase().replace(/\s+/g, '')
  const match = compact.match(/^([A-Z]{1,2}\d[A-Z\d]?)(?=\d[A-Z]{2}$|$)/)
  return match?.[1] || ''
}

export function pluraliseSpaces(count) {
  return `${count} ${count === 1 ? 'space' : 'spaces'}`
}

export function validateGroupSize(groupSize, remainingCapacity) {
  const requested = Number(groupSize)

  if (!Number.isInteger(requested) || requested < 1) {
    return 'Choose at least one space.'
  }

  if (requested > remainingCapacity) {
    return `Only ${pluraliseSpaces(remainingCapacity)} remaining.`
  }

  return ''
}
