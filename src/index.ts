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
import fontpieCalc from 'fontpie-calc'
import { AtRule, Declaration, type PluginCreator, type Result } from 'postcss'
import { toCssString } from './css-string.js'
import { parseFontFamilyNameValue } from './parse-font-family-name-value.js'
import { parseUrlValue } from './parse-url-value.js'

const plugin: PluginCreator<Options> = options => {
  if (!options) {
    throw new Error(`Options are required`)
  }

  return {
    postcssPlugin: `postcss-fontpie`,
    AtRule: {
      'font-face': (fontFaceRule, { result }) => {
        const fontFaceDecls = getFontFaceDecls(fontFaceRule, result)
        if (!fontFaceDecls) {
          return
        }

        const fontFaceValues = parseFontFaceValues(
          fontFaceDecls,
          options,
          result,
        )
        if (!fontFaceValues) {
          return
        }

        fontFaceRule.before(
          generateFallbackFontFaceRule(
            fontFaceRule,
            fontFaceDecls,
            fontFaceValues,
          ),
        )
      },
    },
  }
}
plugin.postcss = true

const getFontFaceDecls = (
  fontFaceRule: AtRule,
  result: Result,
): FontFaceDecls | null => {
  const declsByProp: Map<string, Declaration> = new Map()

  for (const node of fontFaceRule.nodes) {
    const decl = node as Declaration
    const { prop } = decl
    if (!FONT_FACE_DECL_PROPS.has(prop)) {
      continue
    }

    if (declsByProp.has(prop)) {
      decl.warn(result, `Duplicate declaration`)
      return null
    }

    declsByProp.set(prop, decl)
  }

  const src = declsByProp.get(`src`)
  if (src === undefined) {
    fontFaceRule.warn(result, `Missing src`)
    return null
  }

  const family = declsByProp.get(`font-family`)
  if (family === undefined) {
    fontFaceRule.warn(result, `Missing font-family`)
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
  options: Options,
  result: Result,
): FontFaceValues | null => {
  const familyAndType = parseFontFamily(fontFaceDecls.family, options, result)
  if (familyAndType === null) {
    return null
  }

  const filename = parseFontFilename(fontFaceDecls.src, options, result)
  if (filename === null) {
    return null
  }

  return {
    filename,
    ...familyAndType,
    style: fontFaceDecls.style?.value,
    weight: fontFaceDecls.weight?.value,
  }
}

const parseFontFilename = (
  srcDecl: Declaration,
  { srcUrlToFilename = filename => filename }: Options,
  result: Result,
): string | null => {
  const url = parseUrlValue(srcDecl.value)
  if (!url) {
    srcDecl.warn(result, `No url`)
    return null
  }

  return srcUrlToFilename(url)
}

const parseFontFamily = (
  familyDecl: Declaration,
  { fontTypes }: Options,
  result: Result,
): Pick<FontFaceValues, `family` | `type`> | null => {
  const family = parseFontFamilyNameValue(familyDecl.value)
  if (!family) {
    familyDecl.warn(result, `Bad font-family`)
    return null
  }

  if (isFallbackFontFamily(family)) {
    return null
  }

  if (!Object.prototype.hasOwnProperty.call(fontTypes, family)) {
    familyDecl.warn(result, `Missing font type mapping: ${family}`)
    return null
  }

  return { family, type: fontTypes[family]! }
}

const generateFallbackFontFaceRule = (
  fontFaceRule: AtRule,
  fontFaceDecls: FontFaceDecls,
  { filename, family, type, style, weight }: FontFaceValues,
): AtRule => {
  const calcResult = fontpieCalc(filename, {
    name: family,
    fallback: type,
    style,
    weight,
  })
  if (!calcResult) {
    // eslint-disable-next-line typescript/no-throw-literal
    throw fontFaceRule.error(`fontpie error`)
  }

  const {
    fallbackFont,
    ascentOverride,
    descentOverride,
    lineGapOverride,
    sizeAdjust,
  } = calcResult

  return new AtRule({
    name: `font-face`,
    nodes: [
      fontFaceDecls.family.clone({
        value: toCssString(family + FALLBACK_SUFFIX),
      }),
      fontFaceDecls.style,
      fontFaceDecls.weight,
      fontFaceDecls.src.clone({ value: `local(${fallbackFont})` }),
      new Declaration({
        prop: `ascent-override`,
        value: ascentOverride,
      }),
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
  })
}

const isFallbackFontFamily = (family: string): boolean =>
  family.endsWith(FALLBACK_SUFFIX)

const FALLBACK_SUFFIX = ` Fallback`

type FontFaceDecls = {
  src: Declaration
  family: Declaration
  style?: Declaration
  weight?: Declaration
}

type FontFaceValues = {
  filename: string
  family: string
  type: FontType
  style?: string
  weight?: string
}

export type Options = {
  /**
   * A mapping from `font-family` to its font type (`sans-serif`, `serif`, or
   * `mono`).
   *
   * A `@font-face` rule is only processed if its `font-family` is in this
   * mapping.
   */
  readonly fontTypes: Readonly<Record<string, FontType>>

  /**
   * An optional function that transforms a `@font-face` rule's `src` `url`
   * value to a file system path to the font file.
   *
   * The path is resolved relative to `process.cwd()`.
   */
  readonly srcUrlToFilename?: (url: string) => string
}

export type FontType = `sans-serif` | `serif` | `mono`

export default plugin
