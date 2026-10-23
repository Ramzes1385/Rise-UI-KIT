import type { SignaturePoint, SignatureStroke, SignatureRenderOptions } from '../../types/BaseSignaturePad.types'

const MIN_DISTANCE = 1

const round = (value: number): number => Math.round(value * 10) / 10

const clamp = (value: number, max: number): number => Math.min(max, Math.max(0, value))

const pair = ({ x, y }: SignaturePoint): string => `${round(x)} ${round(y)}`

const middle = (from: SignaturePoint, to: SignaturePoint): SignaturePoint => ({ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 })

export function strokePath(points: readonly SignaturePoint[]): string {
	if (points.length === 0) return ''
	if (points.length === 1) return `M${pair(points[0])}h0.1`
	const curves = points.slice(1, -1).map((point, index) => `Q${pair(point)} ${pair(middle(point, points[index + 2]))}`)
	return `M${pair(points[0])}${curves.join('')}L${pair(points[points.length - 1])}`
}

export const signaturePath = (strokes: readonly SignatureStroke[]): string => strokes.map(strokePath).join('')

export function appendPoints(stroke: readonly SignaturePoint[], points: readonly SignaturePoint[]): SignatureStroke {
	const next = [...stroke]
	for (const point of points) {
		const last = next[next.length - 1]
		if (!last || Math.hypot(point.x - last.x, point.y - last.y) >= MIN_DISTANCE) next.push({ x: round(point.x), y: round(point.y) })
	}
	return next
}

export function toViewBox(
	event: { clientX: number; clientY: number },
	rect: { left: number; top: number; width: number; height: number },
	size: { width: number; height: number },
): SignaturePoint {
	const scaleX = size.width / (rect.width || size.width)
	const scaleY = size.height / (rect.height || size.height)
	return {
		x: round(clamp((event.clientX - rect.left) * scaleX, size.width)),
		y: round(clamp((event.clientY - rect.top) * scaleY, size.height)),
	}
}

export function signatureSvg(strokes: readonly SignatureStroke[], options: SignatureRenderOptions): string {
	if (strokes.length === 0) return ''
	const { width, height } = options
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
		options.background ? `<rect width="${width}" height="${height}" fill="${options.background}"/>` : '',
		`<path d="${signaturePath(strokes)}" fill="none" stroke="${options.color}" stroke-width="${options.lineWidth}"`,
		' stroke-linecap="round" stroke-linejoin="round"/>',
		'</svg>',
	].join('')
}
