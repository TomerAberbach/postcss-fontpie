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

import { type TokenString, TokenType, tokenize } from '@csstools/css-tokenizer'
import {
  type ComponentValue,
  isFunctionNode,
  isTokenNode,
  parseListOfComponentValues,
} from '@csstools/css-parser-algorithms'

export const parseUrlValue = (string: string): string | null =>
  parseListOfComponentValues(tokenize({ css: string }))
    .map(
      componentValue =>
        parseUrlToken(componentValue) ?? parseUrlFunction(componentValue),
    )
    .find(Boolean) ?? null

const parseUrlToken = (componentValue: ComponentValue): string | null => {
  if (!isTokenNode(componentValue)) {
    return null
  }

  const token = componentValue.value
  console.log(token)
  return token[0] === TokenType.URL ? token[4].value : null
}

const parseUrlFunction = (componentValue: ComponentValue): string | null => {
  if (!isFunctionNode(componentValue) || componentValue.getName() !== `url`) {
    return null
  }

  const token = componentValue
    .tokens()
    .find((token): token is TokenString => token[0] === TokenType.String)!
  return token[4].value
}
