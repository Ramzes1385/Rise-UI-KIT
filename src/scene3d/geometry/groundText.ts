import { createShelfPacker } from './shelfPacker'
import type { GroundTextAtlas, GroundTextAtlasOptions, GroundTextEntry } from '../types/internal/scene3dGeometry.types'
import { CanvasTexture, LinearMipmapLinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, SRGBColorSpace } from 'three'

const DEFAULT_SIZE = 2048
const DEFAULT_FONT_PX = 56
const DEFAULT_WEIGHT = 600
const LINE_RATIO = 1.35
const PADDING_RATIO = 0.4
const BASELINE_SHIFT = 0.03
const FONT_FAMILY = "'Rise Grotesk', 'Rise CJK SC', 'Rise CJK JP', sans-serif"
const TEXT_RENDER_ORDER = 3

/** Строка шрифта холста для заданных веса и кегля */
export function groundFont(weight: number, fontPx: number): string {
	return `${weight} ${fontPx}px ${FONT_FAMILY}`
}

/** Надпись надо повернуть вокруг вертикали на 180°, иначе при азимуте камеры она читалась бы вверх ногами (угол надписи — как `rotation.y`) */
export function isGroundTextFlipped(textAngle: number, cameraAzimuth: number): boolean {
	return Math.cos(textAngle - cameraAzimuth) < 0
}

/** Повернуть надпись на земле так, чтобы она читалась слева направо с точки зрения камеры с азимутом `cameraAzimuth` */
export function orientGroundText(mesh: Mesh, textAngle: number, cameraAzimuth: number): void {
	mesh.rotation.y = textAngle + (isGroundTextFlipped(textAngle, cameraAzimuth) ? Math.PI : 0)
}

function drawEntry(context: CanvasRenderingContext2D, entry: GroundTextEntry, style: { color: string; fontPx: number }): void {
	context.clearRect(entry.x, entry.y, entry.width, entry.height)
	context.font = groundFont(entry.weight, style.fontPx)
	context.textBaseline = 'middle'
	context.textAlign = 'center'
	context.fillStyle = style.color
	context.fillText(entry.text, entry.x + entry.width / 2, entry.y + entry.height * (0.5 + BASELINE_SHIFT))
}

function createUvMesh(entry: GroundTextEntry, height: number, material: MeshBasicMaterial): Mesh {
	const geometry = new PlaneGeometry(height * entry.aspect, height)
	const uv = geometry.getAttribute('uv')
	for (let index = 0; index < uv.count; index += 1)
		uv.setXY(index, uv.getX(index) ? entry.u1 : entry.u0, uv.getY(index) ? entry.v1 : entry.v0)
	geometry.rotateX(-Math.PI / 2)
	const mesh = new Mesh(geometry, material)
	mesh.renderOrder = TEXT_RENDER_ORDER
	return mesh
}

function createSurface(options: GroundTextAtlasOptions, size: number) {
	const canvas = options.createCanvas ? options.createCanvas() : document.createElement('canvas')
	canvas.width = size
	canvas.height = size
	const texture = new CanvasTexture(canvas)
	texture.colorSpace = SRGBColorSpace
	texture.minFilter = LinearMipmapLinearFilter
	texture.generateMipmaps = true
	const material = new MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false })
	return { context: canvas.getContext('2d') as CanvasRenderingContext2D, texture, material }
}

/**
 * Атлас надписей на земле: все на одном холсте, расставлены полками (строка — высота надписи),
 * на всех один материал и одна текстура
 */
export function createGroundTextAtlas(options: GroundTextAtlasOptions): GroundTextAtlas {
	const size = options.size ?? DEFAULT_SIZE
	const style = { color: options.color, fontPx: options.fontPx ?? DEFAULT_FONT_PX }
	const entries = new Map<string, GroundTextEntry>()
	const { context, texture, material } = createSurface(options, size)
	const lineHeight = Math.ceil(style.fontPx * LINE_RATIO)
	const packer = createShelfPacker(size, lineHeight)

	function add(id: string, text: string, weight = DEFAULT_WEIGHT): GroundTextEntry | null {
		const known = entries.get(id)
		if (known) return known
		context.font = groundFont(weight, style.fontPx)
		const width = Math.ceil(context.measureText(text).width + style.fontPx * PADDING_RATIO)
		const spot = packer.place(width)
		if (!spot) return null
		const [u0, u1] = [spot.x / size, (spot.x + width) / size]
		const [v0, v1] = [1 - (spot.y + lineHeight) / size, 1 - spot.y / size]
		const entry = { id, text, weight, ...spot, u0, u1, v0, v1, width, height: lineHeight, aspect: width / lineHeight }
		entries.set(id, entry)
		drawEntry(context, entry, style)
		texture.needsUpdate = true
		return entry
	}

	return {
		texture,
		material,
		has: id => entries.has(id),
		get: id => entries.get(id),
		add,
		createMesh: (id, height) => {
			const entry = entries.get(id)
			return entry ? createUvMesh(entry, height, material) : null
		},
		recolor: color => {
			style.color = color
			entries.forEach(entry => drawEntry(context, entry, style))
			texture.needsUpdate = true
		},
		refresh: () => void (texture.needsUpdate = true),
		dispose: () => {
			texture.dispose()
			material.dispose()
			entries.clear()
		},
	}
}
