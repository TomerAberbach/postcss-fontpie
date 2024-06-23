<h1 align="center">
  postcss-fontpie
</h1>

<div align="center">
  <a href="https://npmjs.org/package/postcss-fontpie">
    <img src="https://badgen.now.sh/npm/v/postcss-fontpie" alt="version" />
  </a>
  <a href="https://github.com/TomerAberbach/postcss-fontpie/actions">
    <img src="https://github.com/TomerAberbach/postcss-fontpie/workflows/CI/badge.svg" alt="CI" />
  </a>
  <a href="https://github.com/sponsors/TomerAberbach">
    <img src="https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86" alt="Sponsor">
  </a>
</div>

<div align="center">
  A <a href="https://github.com/postcss/postcss">PostCSS</a> plugin for optimizing font loading layout shifts using <a href="https://github.com/pixel-point/fontpie"><code>fontpie</code></a>!
</div>

## Features

- **Automated:** Generates fallback font metrics to match any custom web font!
- **Flexible:** Handles font type (sans serif, serif, and monospace), weight,
  and style
- **Robust:** Powered by the superb
  [`fontpie`](https://github.com/pixel-point/fontpie)

## Install

```sh
$ npm i postcss-fontpie
```

## Usage

**input.css**

```css
@font-face {
  font-family: 'Noto Serif';
  font-weight: 400;
  font-style: italic;
  font-display: swap;
  src: url(NotoSerif-Italic.ttf) format('ttf');
}

@font-face {
  font-family: 'Roboto';
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url(Roboto-Regular.ttf) format('ttf');
}

@font-face {
  font-family: 'Ubuntu Mono';
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  src: url(UbuntuMono-Bold.ttf) format('ttf');
}
```

**index.js:**

```js
import fs from 'node:fs/promises'
import { join } from 'node:path'
import postcss from 'postcss'
import postcssFontpie from 'postcss-fontpie'

const inputPath = `input.css`
const inputCss = await fs.readFile(inputPath, `utf8`)

const outputPath = `output.css`
const outputCss = (
  await postcss([
    postcssFontpie({
      // A mapping from `font-family` to its font type (`sans-serif`, `serif`, or `mono`).
      fontTypes: {
        'Noto Serif': `serif`,
        Roboto: `sans-serif`,
        'Ubuntu Mono': `mono`,
      },

      // An optional function that transforms a font face to a path to the font
      // file.
      resolveFilename: fontFace => join(`./path/to/fonts`, fontFace.src),
    }),
  ]).process(css, { from: inputPath, to: outputPath })
).css
await fs.writeFile(outputPath, outputCss)
```

**output.css**:

```css
@font-face {
  font-family: 'Noto Serif Fallback';
  font-style: italic;
  font-weight: 400;
  src: local(Times New Roman Italic);
  ascent-override: 91.94%;
  descent-override: 25.2%;
  line-gap-override: 0%;
  size-adjust: 116.25%;
}

@font-face {
  font-family: 'Noto Serif';
  font-weight: 400;
  font-style: italic;
  font-display: swap;
  src: url(NotoSerif-Italic.ttf) format('ttf');
}

@font-face {
  font-family: 'Roboto Fallback';
  font-style: normal;
  font-weight: 400;
  src: local(Arial);
  ascent-override: 92.49%;
  descent-override: 24.34%;
  line-gap-override: 0%;
  size-adjust: 100.3%;
}

@font-face {
  font-family: 'Roboto';
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url(Roboto-Regular.ttf) format('ttf');
}

@font-face {
  font-family: 'Ubuntu Mono Fallback';
  font-style: normal;
  font-weight: 700;
  src: local(Courier New Bold);
  ascent-override: 99.62%;
  descent-override: 20.4%;
  line-gap-override: 0%;
  size-adjust: 83.32%;
}

@font-face {
  font-family: 'Ubuntu Mono';
  font-weight: 700;
  font-style: normal;
  font-display: swap;
  src: url(UbuntuMono-Bold.ttf) format('ttf');
}
```

The plugin can also be used in `postcss.config.js`. See
[`fontpie`](https://github.com/pixel-point/fontpie) for font format support and
browser compatibility.

## Contributing

Stars are always welcome!

For bugs and feature requests,
[please create an issue](https://github.com/TomerAberbach/postcss-fontpie/issues/new).

For pull requests, please read the
[contributing guidelines](https://github.com/TomerAberbach/postcss-fontpie/blob/main/contributing.md).

## License

[Apache License 2.0](https://github.com/TomerAberbach/postcss-fontpie/blob/main/license)

This is not an official Google product.
