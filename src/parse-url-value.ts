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
import {
  isFunctionNode,
  isTokenNode,
  parseListOfComponentValues,
} from '@csstools/css-parser-algorithms'

export const parseUrlValue = (string: string): string | null => {
  const componentValues = parseListOfComponentValues(tokenize({ css: string }))
  for (const componentValue of componentValues) {
    if (
      isTokenNode(componentValue) &&
      componentValue.value[0] === TokenType.URL
    ) {
      return componentValue.value[4].value
    }

    if (isFunctionNode(componentValue) && componentValue.getName() === `url`) {
      for (const token of componentValue.tokens()) {
        if (token[0] === TokenType.String) {
          return token[4].value
        }
      }
    }
  }

  return null
}
