import type { Texture } from 'three'
import { SRGBColorSpace, TextureLoader } from 'three'
import { cleanSvg } from '@components/BaseImageMap/model/svg/sanitizeSvg'
import { ensureViewBox } from '@components/BaseImageMap/model/svg/svgViewport'
import type { ImageMapLayer } from '@components/BaseImageMap/types/imageMapData.types'

const SVG_TEXTURE_SCALE = 2
const MAX_TEXTURE_SIZE = 4096

export async function loadLayerSvg(layer: ImageMapLayer, signal: AbortSignal): Promise<string> {
	if (layer.svg) return cleanSvg(layer.svg)
	if (!layer.svgUrl) return ''
	const response = await fetch(layer.svgUrl, { signal })
	return response.ok ? cleanSvg(await response.text()) : ''
}

export function svgTextureMarkup(markup: string, layer: ImageMapLayer): string {
	const scale = Math.min(SVG_TEXTURE_SCALE, MAX_TEXTURE_SIZE / Math.max(layer.width, layer.height, 1))
	const root = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
	ensureViewBox(root, layer)
	root.setAttribute('width', String(Math.round(layer.width * scale)))
	root.setAttribute('height', String(Math.round(layer.height * scale)))
	return new XMLSerializer().serializeToString(root)
}

export async function loadTexture(url: string, loader: TextureLoader = new TextureLoader()): Promise<Texture> {
	const texture = await loader.loadAsync(url)
	texture.colorSpace = SRGBColorSpace
	return texture
}

export async function loadSvgTexture(markup: string, layer: ImageMapLayer, loader?: TextureLoader): Promise<Texture> {
	const url = URL.createObjectURL(new Blob([svgTextureMarkup(markup, layer)], { type: 'image/svg+xml' }))
	try {
		return await loadTexture(url, loader)
	} finally {
		URL.revokeObjectURL(url)
	}
}
