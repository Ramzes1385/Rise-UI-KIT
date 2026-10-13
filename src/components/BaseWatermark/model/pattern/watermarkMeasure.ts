import type { WatermarkFont } from '../../types/BaseWatermark.types'

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const ESTIMATE_RATIO = 0.6

function estimateWidth(line: string, fontSize: number): number {
	return line.length * fontSize * ESTIMATE_RATIO
}

function measureInDom(host: HTMLElement, lines: readonly string[], font: WatermarkFont): number | null {
	const svg = document.createElementNS(SVG_NAMESPACE, 'svg')
	svg.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:0;height:0'
	const text = document.createElementNS(SVG_NAMESPACE, 'text')
	text.setAttribute('font-size', String(font.size))
	text.setAttribute('font-family', font.family)
	svg.append(text)
	host.append(svg)
	const widths: number[] = []
	for (const line of lines) {
		text.textContent = line
		if (typeof text.getComputedTextLength !== 'function') break
		widths.push(text.getComputedTextLength())
	}
	svg.remove()
	return widths.length === lines.length ? Math.max(...widths) : null
}

export function measureLines(host: HTMLElement | null, lines: readonly string[], font: WatermarkFont): number {
	const measured = host ? measureInDom(host, lines, font) : null
	return measured ?? Math.max(...lines.map(line => estimateWidth(line, font.size)))
}
