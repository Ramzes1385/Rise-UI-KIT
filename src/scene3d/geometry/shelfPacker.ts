import type { ShelfPacker } from '../types/internal/scene3dGeometry.types'

/** Укладка слева направо полками высотой `lineHeight`: не поместилось в строку — следующая полка; нет места — `null` */
export function createShelfPacker(size: number, lineHeight: number): ShelfPacker {
	let cursor = { x: 0, y: 0 }
	return {
		place(width) {
			if (width > size || lineHeight > size) return null
			const shelf = cursor.x + width > size ? { x: 0, y: cursor.y + lineHeight } : cursor
			if (shelf.y + lineHeight > size) return null
			cursor = { x: shelf.x + width, y: shelf.y }
			return shelf
		},
	}
}
