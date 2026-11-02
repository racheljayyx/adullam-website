import test from 'node:test'
import assert from 'node:assert/strict'
import { normaliseLocation, normaliseUkPostcode, postcodeArea, validateGroupSize, validateUkPostcode } from '../src/lib/watchPartyRules.js'
import { createRequestId, httpError } from '../src/lib/watchPartiesApi.js'
import { cleanEmail, cleanInteger, extractPostcodeArea, extractPostcodeAreaFromAddress, ValidationError } from '../supabase/functions/_shared/validation.js'
import { normalisePostcodeInput, postcodePoint } from '../supabase/functions/_shared/geocoding.js'

test('normalises locality input without inventing coordinates', () => {
  assert.equal(normaliseLocation('  West   Bridgford '), 'west bridgford')
})

test('extracts UK postcode areas from searches and private addresses', () => {
  assert.equal(postcodeArea('NG7 2BF'), 'NG7')
  assert.equal(extractPostcodeArea('SW1A 1AA'), 'SW1A')
  assert.equal(extractPostcodeAreaFromAddress('10 Example Road, Nottingham NG7 2BF'), 'NG7')
  assert.equal(extractPostcodeArea('Nottingham'), null)
})

test('rejects a group larger than the current remaining capacity', () => {
  assert.equal(validateGroupSize(4, 3), 'Only 3 spaces remaining.')
  assert.equal(validateGroupSize(3, 3), '')
  assert.equal(validateGroupSize(0, 3), 'Choose at least one space.')
})

test('server validation accepts expected values and rejects invalid input', () => {
  assert.equal(cleanEmail(' Person@Example.com '), 'person@example.com')
  assert.equal(cleanInteger('10', 'Search radius', { min: 5, max: 50, allowed: [5, 10, 25, 50] }), 10)
  assert.throws(() => cleanEmail('not-an-email'), ValidationError)
  assert.throws(() => cleanInteger('7', 'Search radius', { min: 5, max: 50, allowed: [5, 10, 25, 50] }), ValidationError)
})

test('normalises a full UK postcode and creates a longitude-first PostGIS point', () => {
  assert.equal(normalisePostcodeInput(' sw1a1aa '), 'SW1A 1AA')
  assert.equal(postcodePoint(-0.1416, 51.501), 'POINT(-0.1416 51.501)')
  assert.throws(() => normalisePostcodeInput('London'), ValidationError)
  assert.throws(() => postcodePoint(Number.NaN, 51.5))
})

test('validates and formats UK postcodes before a request is sent', () => {
  assert.equal(normaliseUkPostcode(' ng72bf '), 'NG7 2BF')
  assert.equal(validateUkPostcode('NG7 2BF'), '')
  assert.equal(normaliseUkPostcode('Nottingham'), '')
  assert.match(validateUkPostcode('Nottingham'), /couldn't recognise/i)
})

test('maps backend failures to safe user-facing error categories', () => {
  const session = httpError(401, { error: { message: 'JWT expired' } }, { requiresAuth: true })
  assert.equal(session.code, 'session_expired')
  assert.match(session.message, /sign in again/i)

  const validation = httpError(400, { error: { code: 'validation_error', message: 'Enter a valid UK postcode.' } })
  assert.equal(validation.code, 'validation_error')
  assert.equal(validation.message, 'Enter a valid UK postcode.')

  const server = httpError(500, { error: { message: 'database password leaked here' } })
  assert.equal(server.code, 'service_unavailable')
  assert.doesNotMatch(server.message, /database|password/i)
})

test('creates valid request identifiers for diagnostics and idempotency', () => {
  assert.match(createRequestId(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
})
