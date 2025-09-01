declare module 'fontpie-calc' {
  export type Options = {
    fallback?: `sans-serif` | `serif` | `mono`
    style?: string
    weight?: string | number
    name?: string
  }

  export type Output = {
    fallbackFont: string
    ascentOverride: string
    descentOverride: string
    lineGapOverride: string
    sizeAdjust: string
    fontFilename: string
    fontFormat: string
    fontStyle: string
    fontWeight: number
  }

  const fontpieCalc: (fontFile: string, options?: Options) => Output | null
  export default fontpieCalc
}
