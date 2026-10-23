import { nextTick } from 'vue'
import { expect } from 'vitest'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { fireEvent, screen, waitFor } from '@testing-library/vue'
import { FLOW_3D, useFlowMap3DEnvironment } from './flowMap3d.test-utils'
import type { FlowMapData, FlowNode } from '@components/BaseFlowMap/types/data/flowData.types'

export const T = UI_FLOW_MAP_3D

export const viewport = (): HTMLElement => screen.getByRole('group', { name: 'Оформление заказа' })
export const tagOf = (container: Element, id: string): HTMLElement => container.querySelector(`[data-label-id="${id}"]`) as HTMLElement

export function pointer(
	type: string,
	target: EventTarget,
	init: { x?: number; y?: number; button?: number; isPrimary?: boolean } = {},
): Promise<void> {
	const event = new MouseEvent(type, {
		bubbles: true,
		cancelable: true,
		clientX: init.x ?? 0,
		clientY: init.y ?? 0,
		button: init.button ?? 0,
	})
	Object.defineProperty(event, 'isPrimary', { value: init.isPrimary ?? true })
	Object.defineProperty(event, 'pointerId', { value: 1 })
	return fireEvent(target as Element, event)
}

export function screenPoint(tag: HTMLElement): { x: number; y: number } {
	const [x, y] = (tag.style.translate || '450px 280px').split(' ').map(part => Number.parseFloat(part))
	return { x, y }
}

export const nodeOf = (data: FlowMapData, id: string): FlowNode | undefined => data.nodes.find(node => node.id === id)

export const CROSS_DATA: FlowMapData = {
	version: 1,
	title: 'Оформление заказа',
	layout: { gridSize: 200 },
	nodes: [
		{ id: 'a', label: 'Центр', kind: 'service', position: { x: 400, y: 400 }, isPinned: true },
		{ id: 'n', label: 'Север', kind: 'service', position: { x: 400, y: 200 }, isPinned: true },
		{ id: 's', label: 'Юг', kind: 'service', position: { x: 400, y: 600 }, isPinned: true },
		{ id: 'w', label: 'Запад', kind: 'service', position: { x: 200, y: 400 }, isPinned: true },
		{ id: 'e', label: 'Восток', kind: 'service', position: { x: 600, y: 400 }, isPinned: true },
	],
	edges: [],
}

export const LONE_DATA: FlowMapData = {
	version: 1,
	title: 'Оформление заказа',
	layout: { gridSize: 40 },
	nodes: [
		{ id: 'a', label: 'Один', kind: 'service', position: { x: 400, y: 400 }, isPinned: true },
		{ id: 'b', label: 'Другой', kind: 'database', position: { x: 800, y: 400 }, isPinned: true },
	],
	edges: [],
}

export function useEditHarness() {
	const env = useFlowMap3DEnvironment()
	async function mountEdit(props: Record<string, unknown> = {}) {
		const map = await env.renderMap({ data: FLOW_3D, mode: 'edit', modes: ['view', 'edit'], ...props })
		await waitFor(() => expect(screen.getByRole('toolbar', { name: T.EDIT_TOOLBAR })).toBeInTheDocument())
		const press = async (key: string, init: ConstructorParameters<typeof KeyboardEvent>[1] = {}): Promise<void> => {
			await fireEvent.keyDown(viewport(), { key, ...init })
			await nextTick()
			env.flushFrames()
		}
		const select = async (...ids: string[]): Promise<void> => {
			map.api().select(ids)
			await nextTick()
			env.flushFrames()
		}
		const data = (): FlowMapData => map.api().getData()
		return { ...map, press, select, data }
	}
	return { env, mountEdit }
}
