import test from 'node:test'
import assert from 'node:assert/strict'
import { normaliseLocation, postcodeArea, validateGroupSize } from '../src/lib/watchPartyRules.js'
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
