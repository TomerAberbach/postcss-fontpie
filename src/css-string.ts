import { addSlashes, getEscapedJsonUnsafe } from 'slashes'

export const toCssString = (string: string): string =>
  `'${addSlashes(string, {
    getEscaped: c => (c === `'` ? `\\'` : getEscapedJsonUnsafe(c)),
  })}'`
