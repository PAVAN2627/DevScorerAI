export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs")
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString()

  const { getDocument } = pdfjs
  const buffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(buffer)

  const loadingTask = getDocument(uint8Array)

  const pdf = await loadingTask.promise
  const pageTexts: string[] = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    const strings = textContent.items
      .map((item) => {
        if ("str" in item) {
          return item.str
        }
        return ""
      })
      .filter(Boolean)

    pageTexts.push(strings.join(" "))
  }

  return pageTexts
    .join("\n\n")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function getExtractionQuality(text: string) {
  const tokens = text.split(/\s+/).filter(Boolean)
  const wordLikeTokens = tokens.filter((token) => /[A-Za-z]{3,}/.test(token)).length
  const qualityRatio = tokens.length ? wordLikeTokens / tokens.length : 0

  return {
    textLength: text.length,
    tokenCount: tokens.length,
    qualityRatio,
    isHighConfidence: text.length > 250 && qualityRatio > 0.45,
  }
}
