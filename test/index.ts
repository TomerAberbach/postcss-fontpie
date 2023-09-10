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
import { join } from 'path'
import postcss from 'postcss'
import type { LazyResult } from 'postcss'
import 'tomer'
import postcssFontpie from '../src/index.js'
import type { FontFace, Options } from '../src/index.js'

test(`postcssFontpie throws for no options`, () => {
  expect(postcssFontpie).toThrow()
})

test(`postcssFontpie throws for both srcUrlToFilename and resolveFilename options`, () => {
  expect(() =>
    postcssFontpie({
      fontTypes: {},
      srcUrlToFilename: () => `hello`,
      resolveFilename: () => `world`,
    }),
  ).toThrow()
})

test(`postcssFontpie throws for fontpie error`, async () => {
  await expect(
    runPostcss(
      `@font-face {
        font-family: 'Noto Serif';
        src: url(i-do-not-exist.ttf) format('ttf');
      }`,
      { fontTypes },
    ),
  ).toReject()
})

const fontTypes: Options[`fontTypes`] = {
  'Noto Serif': `serif`,
  Roboto: `sans-serif`,
  'Ubuntu Mono': `mono`,
  'Ubuntu Mono Bold': `mono`,
}

test.each([
  {
    name: `default resolveFilename`,
    css: `
      @font-face {
        font-family: 'Noto Serif';
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./test/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: 'Roboto';
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url("./test/fonts/roboto/Roboto-Regular.ttf") format('ttf');
      }

      @font-face {
        font-family: Ubuntu Mono;
        font-weight: 700;
        font-style: normal;
        font-display: swap;
        src: url("./test/fonts/ubuntu-mono/UbuntuMono-Bold.ttf" url-modifier) format('ttf');
      }
    `,
    options: { fontTypes },
    expectedWarnings: [],
  },
  {
    name: `custom srcUrlToFilename`,
    css: `
      @font-face {
        font-family: 'Noto Serif';
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: 'Roboto';
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url("/roboto/Roboto-Regular.ttf") format('ttf');
      }

      @font-face {
        font-family: Ubuntu Mono;
        font-weight: 700;
        font-style: normal;
        font-display: swap;
        src: url("/ubuntu-mono/UbuntuMono-Bold.ttf" url-modifier) format('ttf');
      }
    `,
    options: {
      fontTypes,
      srcUrlToFilename: (url: string) => join(`./test/fonts`, url),
    },
    expectedWarnings: [],
  },
  {
    name: `custom resolveFilename`,
    css: `
      @font-face {
        font-family: 'Noto Serif';
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }
    `,
    options: {
      fontTypes,
      resolveFilename: (fontFace: FontFace) => {
        expect(fontFace).toStrictEqual({
          src: `/noto-serif/NotoSerif-Italic.ttf`,
          family: `Noto Serif`,
          type: `serif`,
          style: `italic`,
          weight: `400`,
        })
        return join(`./test/fonts`, fontFace.src)
      },
    },
    expectedWarnings: [],
  },
  {
    name: `font family names`,
    css: `
      @font-face {
        font-family: 'Noto Serif';
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./test/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: 'Roboto';
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url(./test/fonts/roboto/Roboto-Regular.ttf) format('ttf');
      }

      @font-face {
        font-family: Roboto;
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url(./test/fonts/roboto/Roboto-Regular.ttf) format('ttf');
      }

      @font-face {
        font-family: Ubuntu Mono;
        font-weight: 700;
        font-style: normal;
        font-display: swap;
        src: url(./test/fonts/ubuntu-mono/UbuntuMono-Bold.ttf) format('ttf');
      }

      @font-face {
        font-family: Ubuntu/* a comment */Mono  Bold;
        font-weight: 700;
        font-style: normal;
        font-display: swap;
        src: url(./test/fonts/ubuntu-mono/UbuntuMono-Bold.ttf) format('ttf');
      }
    `,
    options: { fontTypes },
    expectedWarnings: [],
  },
  {
    name: `warnings`,
    css: `
      @font-face {
        font-family: 'Noto Serif';
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./test/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: 'Roboto';
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url(./test/fonts/roboto/Roboto-Regular.ttf) format('ttf');
      }

      @font-face {
        font-family: Roboto;
        font-family: Roboto;
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url(./test/fonts/roboto/Roboto-Regular.ttf) format('ttf');
      }

      @font-face {
        font-family: Roboto;
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url(./test/fonts/roboto/Roboto-Regular.ttf) format('ttf');
      }

      @font-face {
        font-family: 'Roboto';
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: something;
      }

      @font-face {
        font-family: 'Roboto';
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: format('ttf');
      }

      @font-face {
        font-family: Ubuntu Mono;
        font-weight: 700;
        font-style: normal;
        font-display: swap;
        src: url(./test/fonts/ubuntu-mono/UbuntuMono-Bold.ttf) format('ttf');
      }

      @font-face {
        font-family: ;
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./test/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: '';
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./test/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: #serif;
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./test/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: Noto 'Serif';
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./test/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: Noto not-a-thing(--serif);
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./test/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: 'Roboto' "Roboto";
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url(./test/fonts/roboto/Roboto-Regular.ttf) format('ttf');
      }
    `,
    options: {
      fontTypes: {
        'Noto Serif': `serif`,
        Roboto: `sans-serif`,
      } as const,
    },
    expectedWarnings: [
      `Duplicate declaration`,
      `Missing src`,
      `Missing font-family`,
      `No url`,
      `No url`,
      `Missing font type mapping: Ubuntu Mono`,
      `Bad font-family`,
      `Bad font-family`,
      `Bad font-family`,
      `Bad font-family`,
      `Bad font-family`,
      `Bad font-family`,
    ],
  },
])(`postcssFontpie: $name`, async ({ css, options, expectedWarnings }) => {
  const result = await runPostcss(css, options)

  const warnings = result
    .warnings()
    .map(String)
    .map(warning =>
      warning.replace(/^postcss-fontpie: <css input>:\d+:\d+: /u, ``),
    )
  expect(warnings).toStrictEqual(expectedWarnings)
  expect(result.css).toMatchSnapshot()
})

const runPostcss = async (
  input: string,
  options: Options,
): Promise<LazyResult> =>
  postcss([postcssFontpie(options)]).process(input, { from: undefined })
