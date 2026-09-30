import { escapeHtml } from '@utils/dom/htmlUtils'
import type { QrSvgParts } from '../../types/BaseQrCode.types'

const CRISP = ' shape-rendering="crispEdges"'

function logoMarkup(logo: QrSvgParts['logo']): string {
	if (!logo) return ''
	const box = `x="${logo.x}" y="${logo.y}" width="${logo.size}" height="${logo.size}"`
	return `<image href="${escapeHtml(logo.href)}" ${box} preserveAspectRatio="xMidYMid meet"/>`
}

export function qrSvgMarkup(parts: QrSvgParts): string {
	const { viewSize, colors, crisp } = parts
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}">`,
		`<rect width="${viewSize}" height="${viewSize}" fill="${escapeHtml(colors.background)}"${CRISP}/>`,
		`<path d="${parts.modules}" fill="${escapeHtml(colors.module)}"${crisp.modules ? CRISP : ''}/>`,
		`<path d="${parts.finder}" fill="${escapeHtml(colors.finder)}" fill-rule="evenodd"${crisp.finder ? CRISP : ''}/>`,
		logoMarkup(parts.logo),
		'</svg>',
	].join('')
}
