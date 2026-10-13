import type { TextTileOptions, TileGeometry, TileSpec, WatermarkGap, WatermarkTile } from '../../types/BaseWatermark.types'

const LINE_HEIGHT_RATIO = 1.4
const PADDING_RATIO = 0.25
const XML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }

export function escapeXml(value: string): string {
	return value.replace(/[&<>"']/g, char => XML_ESCAPES[char])
}

export function normalizeGap(gap: WatermarkGap): [number, number] {
	const [x, y] = typeof gap === 'number' ? [gap, gap] : gap
	return [Math.max(0, x), Math.max(0, y)]
}

export function normalizeLines(content: string | readonly string[] | undefined): string[] {
	const list = typeof content === 'string' ? [content] : (content ?? [])
	return list.map(line => line.trim()).filter(Boolean)
}

export function rotatedSize(width: number, height: number, degrees: number): [number, number] {
	const radians = (degrees * Math.PI) / 180
	const cos = Math.abs(Math.cos(radians))
	const sin = Math.abs(Math.sin(radians))
	return [Math.ceil(width * cos + height * sin - 1e-9), Math.ceil(width * sin + height * cos - 1e-9)]
}

export function tileGeometry(spec: TileSpec): TileGeometry {
	const [boxWidth, boxHeight] = rotatedSize(spec.width, spec.height, spec.rotate)
	const [gapX, gapY] = normalizeGap(spec.gap)
	const cellWidth = Math.ceil(boxWidth + gapX)
	const cellHeight = Math.ceil(boxHeight + gapY)
	return {
		width: cellWidth * 2,
		height: cellHeight * 2,
		centers: [
			[cellWidth / 2, cellHeight / 2],
			[cellWidth * 1.5, cellHeight * 1.5],
		],
	}
}

export function buildTextTile(options: TextTileOptions): WatermarkTile {
	const { lines, font, rotate } = options
	const lineHeight = font.size * LINE_HEIGHT_RATIO
	const geometry = tileGeometry({
		width: options.textWidth + font.size * PADDING_RATIO,
		height: lineHeight * lines.length,
		rotate,
		gap: options.gap,
	})
	const blocks = geometry.centers.map(([x, y]) => {
		const texts = lines
			.map((line, index) => `<text x="${x}" y="${y + (index - (lines.length - 1) / 2) * lineHeight}">${escapeXml(line)}</text>`)
			.join('')
		return `<g transform="rotate(${rotate} ${x} ${y})">${texts}</g>`
	})
	const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" width="${geometry.width}" height="${geometry.height}">` +
		`<g font-family="${escapeXml(font.family)}" font-size="${font.size}" fill="${escapeXml(options.color)}" ` +
		`text-anchor="middle" dominant-baseline="central">${blocks.join('')}</g></svg>`
	return {
		url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
		width: geometry.width,
		height: geometry.height,
		repeat: 'repeat',
	}
}
