export function getRichTextPlainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
}

export function isRichTextEmpty(value: string) {
  return getRichTextPlainText(value).length === 0
}

const ALLOWED_RICH_TEXT_TAGS = new Set([
  "B",
  "BR",
  "EM",
  "I",
  "LI",
  "OL",
  "P",
  "STRONG",
  "UL",
])

export function normalizeRichTextHtml(value: string) {
  const normalizedValue = value.trim()

  if (!normalizedValue || typeof window === "undefined") {
    return normalizedValue
  }

  const parser = new DOMParser()
  const richTextDocument = parser.parseFromString(
    decodeHtmlEntities(normalizedValue),
    "text/html",
  )

  sanitizeRichTextNode(richTextDocument.body)
  removeEmptyRichTextBlocks(richTextDocument.body)

  return richTextDocument.body.innerHTML.trim()
}

function decodeHtmlEntities(value: string) {
  const textArea = document.createElement("textarea")
  textArea.innerHTML = value

  return textArea.value
}

function sanitizeRichTextNode(parent: ParentNode) {
  Array.from(parent.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.remove()
      return
    }

    const element = node as HTMLElement

    if (!ALLOWED_RICH_TEXT_TAGS.has(element.tagName)) {
      const childNodes = Array.from(element.childNodes)
      element.replaceWith(...childNodes)
      sanitizeRichTextNode(parent)
      return
    }

    Array.from(element.attributes).forEach((attribute) => {
      element.removeAttribute(attribute.name)
    })
    sanitizeRichTextNode(element)
  })
}

function removeEmptyRichTextBlocks(parent: HTMLElement) {
  let removedBlock = true

  while (removedBlock) {
    removedBlock = false

    parent.querySelectorAll("p, li, ul, ol").forEach((element) => {
      const hasLineBreak = Boolean(element.querySelector("br"))
      const hasNestedList = Boolean(element.querySelector("ul, ol"))
      const hasText = Boolean(element.textContent?.trim())
      const isList = element.tagName === "UL" || element.tagName === "OL"

      if (!hasLineBreak && (!hasNestedList || isList) && !hasText) {
        element.remove()
        removedBlock = true
      }
    })
  }
}
