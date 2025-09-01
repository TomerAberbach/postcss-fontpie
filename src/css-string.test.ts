import { expect, test } from 'vitest'
import { toCssString } from './css-string.ts'

test.each([
  { string: `a string`, cssString: `'a string'` },
  { string: `a \n ' string`, cssString: `'a \\n \\' string'` },
])(`toCssString: $string -> $cssString`, ({ string, cssString }) => {
  expect(toCssString(string)).toBe(cssString)
})
