import type {FontFamiliy} from "./fonts.server"

export async function loadFont(font: FontFamiliy) {
  const urls = [font.files["regular"]]
  const loadedFonts = await Promise.all(
    urls.map(async (url) => {
      const httpsUrl = url.replace("http://", "https://")
      const fontFace = new FontFace(font.family, `url(${httpsUrl})`)
      return await fontFace.load()
    })
  )

  loadedFonts.forEach((font) => document.fonts.add(font))

  return {
    count: loadedFonts.length,
    font: font,
  }
}
