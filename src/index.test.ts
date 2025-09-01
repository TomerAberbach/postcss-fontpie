import { join } from 'node:path'
import postcss from 'postcss'
import type { LazyResult } from 'postcss'
import { expect, test } from 'vitest'
import postcssFontpie from './index.ts'
import type { FontFace, Options } from './index.ts'

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
        src: url(./src/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: 'Roboto';
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url("./src/fonts/roboto/Roboto-Regular.ttf") format('ttf');
      }

      @font-face {
        font-family: Ubuntu Mono;
        font-weight: 700;
        font-style: normal;
        font-display: swap;
        src: url("./src/fonts/ubuntu-mono/UbuntuMono-Bold.ttf" url-modifier) format('ttf');
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
      srcUrlToFilename: (url: string) => join(`./src/fonts`, url),
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
        return join(`./src/fonts`, fontFace.src)
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
        src: url(./src/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: 'Roboto';
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url(./src/fonts/roboto/Roboto-Regular.ttf) format('ttf');
      }

      @font-face {
        font-family: Roboto;
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url(./src/fonts/roboto/Roboto-Regular.ttf) format('ttf');
      }

      @font-face {
        font-family: Ubuntu Mono;
        font-weight: 700;
        font-style: normal;
        font-display: swap;
        src: url(./src/fonts/ubuntu-mono/UbuntuMono-Bold.ttf) format('ttf');
      }

      @font-face {
        font-family: Ubuntu/* a comment */Mono  Bold;
        font-weight: 700;
        font-style: normal;
        font-display: swap;
        src: url(./src/fonts/ubuntu-mono/UbuntuMono-Bold.ttf) format('ttf');
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
        src: url(./src/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: 'Roboto';
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url(./src/fonts/roboto/Roboto-Regular.ttf) format('ttf');
      }

      @font-face {
        font-family: Roboto;
        font-family: Roboto;
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url(./src/fonts/roboto/Roboto-Regular.ttf) format('ttf');
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
        src: url(./src/fonts/roboto/Roboto-Regular.ttf) format('ttf');
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
        src: url(./src/fonts/ubuntu-mono/UbuntuMono-Bold.ttf) format('ttf');
      }

      @font-face {
        font-family: ;
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./src/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: '';
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./src/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: #serif;
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./src/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: Noto 'Serif';
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./src/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: Noto not-a-thing(--serif);
        font-weight: 400;
        font-style: italic;
        font-display: swap;
        src: url(./src/fonts/noto-serif/NotoSerif-Italic.ttf) format('ttf');
      }

      @font-face {
        font-family: 'Roboto' "Roboto";
        font-weight: 400;
        font-style: normal;
        font-display: swap;
        src: url(./src/fonts/roboto/Roboto-Regular.ttf) format('ttf');
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
