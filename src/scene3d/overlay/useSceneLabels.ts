import type { Camera } from 'three'
import type { ShallowRef } from 'vue'
import { projectLabels, resolveOverlaps } from './labelLayout'
import type {
	Scene3DLabelBox,
	Scene3DLabelItem,
	Scene3DLabels,
	Scene3DLabelSpot,
	Scene3DScreenSize,
} from '../types/internal/scene3dInternal.types'

/** Атрибут элемента подписи в слое: значение — id подписи */
export const LABEL_ID_ATTR = 'data-label-id'

const STAMP_LENGTH = 34

function readStamp(camera: Camera, size: Scene3DScreenSize, stamp: Float64Array): boolean {
	camera.updateMatrixWorld()
	const next = [...camera.matrixWorld.elements, ...camera.projectionMatrix.elements, size.width, size.height]
	const isChanged = next.some((value, index) => stamp[index] !== value)
	if (isChanged) stamp.set(next)
	return isChanged
}

function findElements(layer: HTMLElement | null, items: readonly Scene3DLabelItem[]): Map<string, HTMLElement> {
	const found = new Map<string, HTMLElement>()
	layer?.querySelectorAll<HTMLElement>(`[${LABEL_ID_ATTR}]`).forEach(element => {
		const id = element.getAttribute(LABEL_ID_ATTR) as string
		if (items.some(item => item.id === id)) found.set(id, element)
	})
	return found
}

function paint(elements: ReadonlyMap<string, HTMLElement>, spots: ReadonlyMap<string, Scene3DLabelSpot>): void {
	elements.forEach((element, id) => {
		const spot = spots.get(id) as Scene3DLabelSpot
		element.style.translate = `${Math.round(spot.x * 10) / 10}px ${Math.round(spot.y * 10) / 10}px`
		element.style.visibility = spot.isVisible ? 'visible' : 'hidden'
	})
}

function measure(elements: ReadonlyMap<string, HTMLElement>): Map<string, Scene3DLabelBox> {
	return new Map([...elements].map(([id, element]) => [id, { width: element.offsetWidth, height: element.offsetHeight }]))
}

/**
 * Подписи HTML поверх холста: Vue рисует список один раз при смене данных, положения пишутся прямо в `style`.
 * Перекрытия пересчитываются, только когда сдвинулась камера, изменился размер или данные
 */
export function useSceneLabels(layer: Readonly<ShallowRef<HTMLElement | null>>): Scene3DLabels {
	const stamp = new Float64Array(STAMP_LENGTH)
	let items: readonly Scene3DLabelItem[] = []
	let elements = new Map<string, HTMLElement>()
	let spots = new Map<string, Scene3DLabelSpot>()
	let isDirty = true

	return {
		layer,
		get spots() {
			return spots
		},
		setItems(next) {
			items = next
			elements = new Map()
			isDirty = true
		},
		markDirty() {
			isDirty = true
		},
		update(camera, size) {
			const isMoved = readStamp(camera, size, stamp)
			if (!isMoved && !isDirty) return
			if (!elements.size || elements.size < items.length) elements = findElements(layer.value, items)
			isDirty = false
			spots = projectLabels(items, camera, size)
			resolveOverlaps(items, spots, measure(elements))
			paint(elements, spots)
		},
		dispose() {
			items = []
			elements = new Map()
			spots = new Map()
			isDirty = true
			stamp.fill(0)
		},
	}
}
