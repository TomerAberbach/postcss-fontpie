import {
  isFunctionNode,
  isTokenNode,
  parseListOfComponentValues,
} from '@csstools/css-parser-algorithms'
import type { ComponentValue } from '@csstools/css-parser-algorithms'
import { TokenType, tokenize } from '@csstools/css-tokenizer'
import type { TokenString } from '@csstools/css-tokenizer'

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
