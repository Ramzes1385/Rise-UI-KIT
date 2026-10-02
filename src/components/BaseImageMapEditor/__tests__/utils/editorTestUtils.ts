import { fireEvent, render } from '@testing-library/vue'
import BaseImageMapEditor from '../../ui/BaseImageMapEditor.vue'
import type { BaseImageMapEditorProps } from '../../types/BaseImageMapEditor.types'
import type { ImageMapData } from '@components/BaseImageMap/types/imageMapData.types'

const STAGE_WIDTH = 1000
const STAGE_HEIGHT = 500

export function makeMap(): ImageMapData {
	return {
		version: 1,
		layers: [
			{ id: 'l1', title: 'Первый', shortTitle: '1', image: 'https://example.com/1.png', width: 1000, height: 500 },
			{ id: 'l2', title: 'Второй', image: 'https://example.com/2.png', width: 1000, height: 500 },
		],
		groups: [{ id: 'g1', title: 'Магазины', icon: 'star' }],
		objects: [
			{ type: 'rect', id: 'r1', title: 'Зал', x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
			{ type: 'point', id: 'p1', title: 'Вход', x: 0.5, y: 0.5, layer: 'l1', group: 'g1' },
			{
				type: 'polygon',
				id: 'pg',
				title: 'Сквер',
				points: [
					[0.6, 0.6],
					[0.8, 0.6],
					[0.7, 0.8],
				],
			},
			{ type: 'ellipse', id: 'e1', title: 'Фонтан', x: 0.4, y: 0.7, rx: 0.05, ry: 0.05, layer: 'l2' },
		],
	}
}

export const SVG_MARKUP =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"><rect id="hall" width="10" height="10"><title>Холл</title></rect><rect id="shop" width="10" height="10"/><circle id="s1" r="4"/></svg>'

export function makeSvgMap(): ImageMapData {
	return {
		version: 1,
		layers: [{ id: 'f1', title: 'Этаж', svg: SVG_MARKUP, width: 800, height: 400 }],
		objects: [{ type: 'svg', id: 's1', title: 'Склад', elementId: 's1' }],
	}
}

export function renderEditor(props: Partial<BaseImageMapEditorProps> = {}, options: Record<string, unknown> = {}) {
	const result = render(BaseImageMapEditor, { props: { modelValue: makeMap(), ...props }, ...options })
	if (result.container.querySelector('.base-image-map-editor__stage')) stageOf(result.container)
	return { ...result, stage: () => stageOf(result.container) }
}

export function stageOf(container: Element): HTMLElement {
	const stage = container.querySelector<HTMLElement>('.base-image-map-editor__stage')
	if (!stage) throw new Error('stage')
	stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: STAGE_WIDTH, height: STAGE_HEIGHT }) as DOMRect
	return stage
}

export function at(x: number, y: number) {
	return { button: 0, pointerId: 1, clientX: x * STAGE_WIDTH, clientY: y * STAGE_HEIGHT }
}

export async function drag(stage: HTMLElement, path: { from: [number, number]; to: [number, number]; target?: Element }) {
	await fireEvent.pointerDown(path.target ?? stage, at(...path.from))
	await fireEvent.pointerMove(stage, at(...path.to))
	await fireEvent.pointerUp(stage, at(...path.to))
}

export function lastModel(emitted: () => Record<string, unknown[][]>): ImageMapData {
	const events = emitted()['update:modelValue'] ?? []
	return events[events.length - 1]?.[0] as ImageMapData
}

export function objectEl(container: Element, id: string): Element {
	const element = container.querySelector(`[data-editor-object="${id}"]`)
	if (!element) throw new Error(id)
	return element
}

export function statusOf(container: Element): HTMLElement {
	return container.querySelector('.base-image-map-editor__status') as HTMLElement
}

export function pressKey(target: Element, init: ConstructorParameters<typeof KeyboardEvent>[1]): boolean {
	return target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }))
}
