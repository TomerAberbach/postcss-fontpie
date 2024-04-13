/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TokenType, tokenize } from '@csstools/css-tokenizer'
import type { CSSToken } from '@csstools/css-tokenizer'

export const parseFontFamilyNameValue = (string: string): string | null => {
  const tokens = tokenize({ css: string }).filter(
    ([tokenType]) => !IGNORED_TOKEN_TYPES.has(tokenType),
  )
  return (
    parseFontFamilyNameString(tokens) ?? parseFontFamilyNameIdentifiers(tokens)
  )
}

const IGNORED_TOKEN_TYPES: ReadonlySet<TokenType> = new Set([
  TokenType.Comment,
  TokenType.Whitespace,
  TokenType.EOF,
])

const parseFontFamilyNameString = (tokens: CSSToken[]): string | null => {
  if (tokens.length !== 1) {
    return null
  }

  const token = tokens[0]!
  return token[0] === TokenType.String ? token[4].value : null
}

const parseFontFamilyNameIdentifiers = (tokens: CSSToken[]): string | null => {
  if (tokens.length === 0) {
    return null
  }

  const identifiers = []
  for (const token of tokens) {
    if (token[0] !== TokenType.Ident) {
      return null
    }

    identifiers.push(token[4].value)
  }
  return identifiers.join(` `)
}
