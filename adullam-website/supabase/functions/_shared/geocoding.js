import { ValidationError } from './validation.js'

const ukPostcodePattern = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i

export function normalisePostcodeInput(value) {
  if (typeof value !== 'string') throw new ValidationError('Postcode is required.')
  const compact = value.trim().toUpperCase().replace(/\s+/g, '')
  if (!ukPostcodePattern.test(compact)) throw new ValidationError('Enter a valid UK postcode.')
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`
}

export function postcodePoint(longitude, latitude) {
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    throw Object.assign(new Error('Location coordinates are unavailable for this postcode.'), { status: 422 })
  }
  return `POINT(${longitude} ${latitude})`
}

export async function geocodeUkPostcode(value) {
  const requestedPostcode = normalisePostcodeInput(value)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 6000)

  try {
    const compact = requestedPostcode.replace(/\s/g, '')
    const response = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(compact)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    if (response.status === 404) throw new ValidationError('Enter a recognised UK postcode.')
    if (!response.ok) throw new Error(`Postcode lookup failed with status ${response.status}.`)

    const payload = await response.json()
    const result = payload?.result
    if (!result) throw new ValidationError('Enter a recognised UK postcode.')

    const longitude = Number(result.longitude)
    const latitude = Number(result.latitude)
    return {
      postcode: normalisePostcodeInput(result.postcode || requestedPostcode),
      outcode: String(result.outcode || requestedPostcode.split(' ')[0]).toUpperCase(),
      longitude,
      latitude,
      point: postcodePoint(longitude, latitude),
      district: result.admin_district || null,
      region: result.region || null,
    }
  } catch (error) {
    if (error instanceof ValidationError || error?.status === 422) throw error
    console.error(error)
    throw Object.assign(new Error('We could not validate that postcode right now. Please try again.'), { status: 503 })
  } finally {
    clearTimeout(timeout)
  }
}

