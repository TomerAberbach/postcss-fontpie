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

import 'tomer'
import postcss from 'postcss'
import type { LazyResult } from 'postcss'
import postcssFontpie from '../src/index.js'
import type { Options } from '../src/index.js'

test(`postcssFontpie throws for no options`, () => {
  expect(postcssFontpie).toThrow()
})

const fontTypes: Options[`fontTypes`] = {
  'Noto Serif': `serif`,
  Roboto: `sans-serif`,
  'Ubuntu Mono': `mono`,
}

test.each([
  {
    name: `default srcUrlToFilename`,
    css: `
      @font-face {
        font-family: 'Noto Serif';
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./test/fonts/noto-serif/NotoSerif-Italic.ttf);
      }

      @font-face {
        font-family: 'Roboto';
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url(./test/fonts/roboto/Roboto-Regular.ttf);
      }

      @font-face {
        font-family: Ubuntu Mono;
        font-weight: 700;
        font-style: normal;
        font-display: swap;
        src: url(./test/fonts/ubuntu-mono/UbuntuMono-Bold.ttf);
      }
    `,
    options: { fontTypes },
    expectedWarnings: [],
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
