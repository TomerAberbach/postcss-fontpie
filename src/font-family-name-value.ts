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

export const fontFamilyNameValue = (string: string): string | undefined => {
  const tokens = tokenize({ css: string }).filter(
    x =>
      x[0] !== TokenType.Comment &&
      x[0] !== TokenType.Whitespace &&
      x[0] !== TokenType.EOF,
  )

  if (tokens.length === 0) {
    return undefined
  }

  if (tokens.length === 1 && tokens[0]) {
    if (tokens[0][0] === TokenType.Ident) {
      return tokens[0][4].value
    }
    if (tokens[0][0] === TokenType.String) {
      return tokens[0][4].value
    }
  }

  const identTokens = []
  for (const token of tokens) {
    if (token[0] !== TokenType.Ident) {
      return undefined
    }
    identTokens.push(token)
  }

  return identTokens.map(token => token[4].value).join(` `)
}
