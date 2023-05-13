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

import fs from 'fs/promises'
import postcss from 'postcss'
import postcssFontpie from 'postcss-fontpie'

const inputPath = `./playground/styles.css`
const inputCss = await fs.readFile(inputPath, `utf8`)

const outputPath = `./playground/dist.css`
const outputCss = (
  await postcss([
    postcssFontpie({
      fontTypes: {
        'Noto Serif': `serif`,
        Roboto: `sans-serif`,
        'Ubuntu Mono': `mono`,
      },
    }),
  ]).process(inputCss, { from: inputPath, to: outputPath })
).css
await fs.writeFile(outputPath, outputCss)
