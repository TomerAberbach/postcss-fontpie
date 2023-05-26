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

const IGNORED_TOKEN_TYPES: ReadonlySet<TokenType> = new Set([
  TokenType.Comment,
  TokenType.Whitespace,
  TokenType.EOF,
])

export const parseFontFamilyNameValue = (string: string): string | null => {
  const tokens = tokenize({ css: string }).filter(
    ([tokenType]) => !IGNORED_TOKEN_TYPES.has(tokenType),
  )

  if (tokens.length === 0) {
    return null
  }

  if (tokens.length === 1 && tokens[0]![0] === TokenType.String) {
    return tokens[0][4].value
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
