import { vi } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import type { ImageMapData } from '../types/imageMapData.types'

export interface TestRect {
	left: number
	top: number
	width: number
	height: number
}

const VIEWPORT = { width: 800, height: 500 }

export const SIMPLE_DATA: ImageMapData = {
	layers: [{ id: 'base', title: 'Схема', image: 'plan.png', imageAlt: 'План', width: 800, height: 500 }],
	objects: [
		{ id: 'a', type: 'point', title: 'Точка А', x: 0.25, y: 0.5 },
		{ id: 'b', type: 'point', title: 'Точка Б', x: 0.75, y: 0.5 },
	],
}

function toDomRect({ left, top, width, height }: TestRect): DOMRect {
	return { left, top, width, height, x: left, y: top, right: left + width, bottom: top + height, toJSON: () => ({}) } as DOMRect
}

export function mockViewport(size = VIEWPORT): void {
	const pick = (element: HTMLElement, value: number): number => (element.classList.contains('base-image-map__viewport') ? value : 0)
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
		return pick(this, size.width)
	})
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(function (this: HTMLElement) {
		return pick(this, size.height)
	})
}

export function mockRects(rects: Record<string, TestRect>, stage: TestRect = { left: 0, top: 0, ...VIEWPORT }): void {
	vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
		const id = this.getAttribute('data-image-map-object')
		if (id && rects[id]) return toDomRect(rects[id])
		if (this.classList.contains('base-image-map__stage')) return toDomRect(stage)
		return toDomRect({ left: 0, top: 0, width: 10, height: 10 })
	})
}

export function stageTransform(container: Element): string {
	return (container.querySelector('.base-image-map__stage') as HTMLElement).style.transform
}

export function objectElement(container: Element, id: string): HTMLElement {
	return container.querySelector(`[data-image-map-object="${id}"]`) as HTMLElement
}

export async function pointer(
	target: Element,
	type: 'pointerDown' | 'pointerMove' | 'pointerUp' | 'pointerCancel',
	init: Record<string, number | string>,
): Promise<void> {
	await fireEvent[type](target, { pointerType: 'mouse', pointerId: 1, button: 0, ...init })
}
