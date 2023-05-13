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

test.each([
  `@font-face {
    font-family: 'Kantumruy Pro';
    font-weight: 500;
    font-style: normal;
    font-display: swap;
    src: url(./test/fixtures/KantumruyPro-Medium.ttf);
  }

  @font-face {
    font-family: 'Kantumruy Pro';
    font-weight: 600;
    font-style: normal;
    font-display: swap;
    src: url(./test/fixtures/KantumruyPro-SemiBold.woff2) format('woff2');
  }

  @font-face {
    font-family: 'Kantumruy Pro';
    font-weight: 600;
    font-style: italic;
    font-display: swap;
    src: url(./test/fixtures/KantumruyPro-SemiBoldItalic.woff) format('woff');
  }

  @font-face {
    font-family: 'Kantumruy Pro';
    font-weight: 700;
    font-style: italic;
    font-display: swap;
    src: url(./test/fixtures/KantumruyPro-BoldItalic.ttf) format('ttf');
  }`,
])(`postcssFontpie`, async css => {
  const result = await runPostcss(css)

  expect(result.warnings().map(String)).toBeEmpty()
  expect(result.css).toMatchSnapshot()
})

const runPostcss = async (input: string): Promise<LazyResult> =>
  postcss([
    postcssFontpie({
      fontTypes: {
        'Kantumruy Pro': `sans-serif`,
      },
    }),
  ]).process(input, { from: undefined })
