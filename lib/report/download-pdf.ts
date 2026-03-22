type PdfMeta = Record<string, string | number>

type PdfSection = {
  heading: string
  lines: string[]
}

type PdfReportInput = {
  fileName: string
  title: string
  meta?: PdfMeta
  sections: PdfSection[]
}

export function downloadReportPdf(input: PdfReportInput) {
  if (typeof window === "undefined") {
    return
  }

  void (async () => {
    const { jsPDF } = await import("jspdf/dist/jspdf.es.min.js")

  const doc = new jsPDF({ unit: "pt", format: "a4" })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 48
  const contentWidth = pageWidth - marginX * 2
  const lineHeight = 16

  let y = 56

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight <= pageHeight - 48) return
    doc.addPage()
    y = 56
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(18)
  doc.text(input.title, marginX, y)
  y += 26

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, y)
  y += 20

  if (input.meta) {
    const metaLines = Object.entries(input.meta).map(([key, value]) => `${key}: ${String(value)}`)
    metaLines.forEach((line) => {
      ensureSpace(lineHeight)
      const wrapped = doc.splitTextToSize(line, contentWidth)
      doc.text(wrapped, marginX, y)
      y += wrapped.length * lineHeight
    })
    y += 10
  }

  input.sections.forEach((section) => {
    ensureSpace(28)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.text(section.heading, marginX, y)
    y += 20

    doc.setFont("helvetica", "normal")
    doc.setFontSize(11)

    if (section.lines.length === 0) {
      ensureSpace(lineHeight)
      doc.text("-", marginX, y)
      y += lineHeight
      return
    }

    section.lines.forEach((line) => {
      const bulletLine = `- ${line}`
      const wrapped = doc.splitTextToSize(bulletLine, contentWidth)
      ensureSpace(wrapped.length * lineHeight)
      doc.text(wrapped, marginX, y)
      y += wrapped.length * lineHeight
    })

    y += 10
  })

  doc.save(input.fileName)
  })()
}
