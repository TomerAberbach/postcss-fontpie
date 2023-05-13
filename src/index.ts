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

import { AtRule, Declaration, type PluginCreator, type Result } from 'postcss'
import fontpieCalc from 'fontpie-calc'
import { parse } from 'postcss-values-parser'
import type { ContainerBase, Func } from 'postcss-values-parser'

const plugin: PluginCreator<Record<string, never>> = () => ({
  postcssPlugin: `postcss-fontpie`,
  AtRule: {
    'font-face': (fontFaceRule, { result }) => {
      const decls = getFontFaceDecls(fontFaceRule, result)
      if (!decls) {
        return
      }

      const values = parseFontFaceValues(decls, result)
      if (!values) {
        return
      }

      const { filename, family, style, weight } = values
      const {
        fallbackFont,
        ascentOverride,
        descentOverride,
        lineGapOverride,
        sizeAdjust,
      } = fontpieCalc(filename, {
        name: family,
        style,
        weight,
      })

      fontFaceRule.before(
        new AtRule({
          name: `font-face`,
          nodes: [
            decls.family.clone({
              value: `'${`${family} Fallback`.replaceAll(`'`, `\\'`)}'`,
            }),
            decls.style,
            decls.weight,
            decls.src.clone({ value: `local(${fallbackFont})` }),
            new Declaration({ prop: `ascent-override`, value: ascentOverride }),
            new Declaration({
              prop: `descent-override`,
              value: descentOverride,
            }),
            new Declaration({
              prop: `line-gap-override`,
              value: lineGapOverride,
            }),
            new Declaration({ prop: `size-adjust`, value: sizeAdjust }),
          ].filter((decl): decl is Declaration => Boolean(decl)),
          source: fontFaceRule.source,
        }),
      )
    },
  },
})
plugin.postcss = true

const getFontFaceDecls = (
  fontFaceRule: AtRule,
  result: Result,
): FontFaceDecls | null => {
  const declsByProp: Map<string, Declaration> = new Map()

  for (const decl of fontFaceRule.nodes) {
    if (decl.type !== `decl`) {
      continue
    }

    const { prop } = decl
    if (!FONT_FACE_DECL_PROPS.has(prop)) {
      continue
    }

    if (declsByProp.has(prop)) {
      decl.warn(result, `Duplicate declration`)
      return null
    }

    declsByProp.set(prop, decl)
  }

  const src = declsByProp.get(`src`)
  const family = declsByProp.get(`font-family`)
  if (src === undefined || family === undefined) {
    fontFaceRule.warn(result, `Missing src or font-family`)
    return null
  }

  return {
    src,
    family,
    style: declsByProp.get(`font-style`),
    weight: declsByProp.get(`font-weight`),
  }
}

const REQUIRED_FONT_FACE_DECL_PROPS = [`src`, `font-family`]
const FONT_FACE_DECL_PROPS = new Set([
  ...REQUIRED_FONT_FACE_DECL_PROPS,
  `font-style`,
  `font-weight`,
])

const parseFontFaceValues = (
  fontFaceDecls: FontFaceDecls,
  result: Result,
): FontFaceValues | null => {
  const { src, family, style, weight } = fontFaceDecls

  const filename = parseFontFilename(src, result)
  if (filename === null) {
    return null
  }

  return {
    filename,
    family: stringifyWithoutQuotes(parse(family.value)),
    style: style?.value,
    weight: weight?.value,
  }
}

type FontFaceDecls = {
  src: Declaration
  family: Declaration
  style?: Declaration
  weight?: Declaration
}

type FontFaceValues = {
  filename: string
  family: string
  style?: string
  weight?: string
}

const parseFontFilename = (src: Declaration, result: Result): string | null => {
  const urlNode = parse(src.value).nodes.find(
    (node): node is Func => node.type === `func` && node.name === `url`,
  )
  if (!urlNode) {
    src.warn(result, `No url`)
    return null
  }

  return stringifyWithoutQuotes(urlNode)
}

const stringifyWithoutQuotes = (root: ContainerBase): string => {
  let string = ``
  for (const node of root.nodes) {
    switch (node.type) {
      case `operator`:
      case `punctuation`:
      case `word`:
        string += node.value
        break
      case `quoted`:
        string += node.contents
        break
      default:
        continue
    }
  }
  return string
}

export default plugin
