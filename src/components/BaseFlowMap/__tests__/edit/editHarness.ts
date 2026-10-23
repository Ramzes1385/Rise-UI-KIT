import { expect } from 'vitest'
import { BaseApp } from '@components/BaseApp'
import BaseFlowMap from '../../ui/BaseFlowMap.vue'
import { screen, waitFor } from '@testing-library/vue'
import { configure, render } from '@testing-library/vue'
import { defineComponent, h, isVNode, nextTick } from 'vue'
import { getFlowEditing } from '../../model/edit/useFlowEditing'
import * as servicesModule from '../../model/notations/services'
import type { FlowMapData } from '../../types/data/flowData.types'
import { useFlowMapContext } from '../../model/context/flowContext'
import type { BaseFlowMapProps } from '../../types/BaseFlowMap.types'
import type { FlowMapContext } from '../../types/internal/flowModel.types'
import type { FlowMapController } from '../../types/api/flowController.types'
import type { FlowEditContext } from '../../types/internal/edit/flowEditApi.types'
import { controllerOf, mapData, mountMap, sceneView, stubFrame } from '../core/ui/flowUi'
import type { FlowModelInternal } from '../../types/internal/core/flowRenderInternal.types'

configure({ asyncUtilTimeout: 15000 })

export { mapData, waitFor, screen }

interface Mods {
	shiftKey?: boolean
	ctrlKey?: boolean
	metaKey?: boolean
	altKey?: boolean
	button?: number
}

export async function settle(times = 4): Promise<void> {
	for (let index = 0; index < times; index += 1) {
		await nextTick()
		await Promise.resolve()
	}
}

export function flush(): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, 0))
}

export interface ProbeScope {
	model: FlowModelInternal
	context: FlowEditContext
	map: FlowMapContext
}

let probeRunner: ((scope: ProbeScope) => unknown) | null = null
let probeResult: unknown

const Probe = defineComponent({
	setup() {
		const map = useFlowMapContext()
		const { context } = getFlowEditing(map.model)
		probeResult = probeRunner?.({ model: map.model as never, context, map })
		return () => (isVNode(probeResult) ? probeResult : null)
	},
})

type PointInit = Mods & { clientX: number; clientY: number }

interface MountOptions {
	width?: number
	withApp?: boolean
	slots?: Record<string, unknown>
}

function renderInApp(props: Partial<BaseFlowMapProps>) {
	let ready: FlowMapController | undefined
	const result = render(
		defineComponent({
			render: () =>
				h(BaseApp, null, () =>
					h(BaseFlowMap, { data: mapData(), ...props, onReady: (value: FlowMapController) => (ready = value) }),
				),
		}),
	)
	return { result: Object.assign(result, { emitted: () => ({}) as Record<string, unknown[][]> }), ready: () => ready }
}

function renderMap(props: Partial<BaseFlowMapProps>, options: MountOptions) {
	const { withApp, width: _width, ...renderOptions } = options
	if (withApp) return renderInApp(props)
	const result = mountMap(props, { ...renderOptions, slots: { 'inspector-end': () => h(Probe), ...renderOptions.slots } })
	return { result, ready: () => controllerOf(result) }
}

function keyCode(name: string): string {
	if (/^[a-z]$/i.test(name)) return `Key${name.toUpperCase()}`
	return /^\d$/.test(name) ? `Digit${name}` : name
}

function createGestures(container: Element, root: HTMLElement) {
	const view = () => sceneView(container)
	const at = (x: number, y: number) => {
		const { x: left, y: top, zoom } = view()
		return { clientX: x * zoom + left, clientY: y * zoom + top }
	}
	const pointer = (type: string, target: EventTarget, init: PointInit) => {
		const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...init })
		target.dispatchEvent(event)
		return event
	}
	const finish = async () => {
		await settle()
		await flush()
		await settle()
	}
	const drag = async (target: Element, path: Array<[number, number]>, mods: Mods = {}) => {
		const [first, ...rest] = path
		pointer('pointerdown', target, { ...at(first[0], first[1]), ...mods })
		for (const [x, y] of rest) pointer('pointermove', window, { ...at(x, y), ...mods })
		const last = rest.at(-1) ?? first
		pointer('pointerup', window, { ...at(last[0], last[1]), ...mods })
		await finish()
	}
	const click = async (target: Element, point: [number, number], mods: Mods = {}) => {
		const init = { ...at(point[0], point[1]), ...mods }
		pointer('pointerdown', target, init)
		pointer('pointerup', window, init)
		pointer('click', target, init)
		await finish()
	}
	const key = (target: Element, name: string, mods: Mods = {}) => {
		const event = new KeyboardEvent('keydown', { key: name, code: keyCode(name), bubbles: true, cancelable: true, ...mods })
		target.dispatchEvent(event)
		return event
	}
	const press = async (name: string, mods: Mods = {}, target: Element = root) => {
		const event = key(target, name, mods)
		await finish()
		return event
	}
	return { view, at, pointer, drag, click, key, press }
}

export async function mountEdit(props: Partial<BaseFlowMapProps> = {}, options: MountOptions = {}) {
	stubFrame(options.width ?? 1000, 600)
	const base = { mode: 'edit', modes: ['view', 'edit', 'review'], ...props } as Partial<BaseFlowMapProps>
	const { result, ready } = renderMap(base, options)
	await settle()
	if (base.mode === 'edit' && (options.width ?? 1000) >= 700)
		await waitFor(() => expect(result.container.querySelector('.base-flow-map__edit-status')).not.toBeNull())
	if (base.mode === 'review') await waitFor(() => expect(result.container.querySelector('.base-flow-map__review')).not.toBeNull())
	if ((options.width ?? 1000) < 700) await new Promise(resolve => setTimeout(resolve, 60))
	const root = result.container.querySelector('.base-flow-map__viewport') as HTMLElement
	const controller = ready() as FlowMapController
	controller.setViewport({ x: 100, y: 100, zoom: 1 })
	await settle()
	const find = (entity: string, id: string) =>
		result.container.querySelector(`[data-flow-entity="${entity}"][data-flow-id="${id}"]`) as HTMLElement
	const data = (): FlowMapData => controller.getData()
	const probe = async <T>(run: (scope: ProbeScope) => T): Promise<T> => {
		probeRunner = run
		controller.select([])
		await settle()
		controller.select(['gw'])
		await settle()
		return probeResult as T
	}
	return {
		...result,
		probe,
		...createGestures(result.container, root),
		controller,
		root,
		node: (id: string) => find('node', id),
		element: find,
		data,
	}
}

export type EditMap = Awaited<ReturnType<typeof mountEdit>>

const pinned = (x: number, y: number) => ({ position: { x, y }, isPinned: true })

export function editData(patch: Partial<FlowMapData> = {}): FlowMapData {
	return {
		version: 1,
		title: 'Заказы',
		nodes: [
			{ id: 'gw', kind: 'gateway', label: 'Шлюз', ...pinned(0, 0) },
			{ id: 's1', kind: 'service', label: 'Заказы', group: 'z1', ...pinned(400, 0) },
			{ id: 's2', kind: 'service', label: 'Оплата', group: 'z1', ...pinned(400, 160) },
			{ id: 'db', kind: 'database', label: 'База', ...pinned(800, 0) },
			{ id: 'nt', kind: 'note', label: 'Заметка', ...pinned(800, 300) },
		],
		edges: [
			{ id: 'e1', source: 'gw', target: 's1' },
			{ id: 'e2', source: 's1', target: 'db', kind: 'data' },
		],
		groups: [{ id: 'z1', kind: 'zone', label: 'Ядро' }],
		...patch,
	}
}

export async function liveText(result: { container: Element }): Promise<string> {
	await new Promise(resolve => setTimeout(resolve, 80))
	await settle()
	return result.container.querySelector('div.base-flow-map__sr[aria-atomic]')?.textContent ?? ''
}

export function propsNotation() {
	const { flowServices } = servicesModule
	const service = flowServices.nodeKinds.service
	const widget = {
		...service,
		label: () => 'Виджет',
		paletteGroup: 'my-group',
		model3d: 'crane',
		props: {
			count: { label: () => 'Число', type: 'number' as const, default: 3 },
			flag: { label: () => 'Флаг', type: 'boolean' as const },
			mode: {
				label: () => 'Режим',
				type: 'select' as const,
				options: [
					{ value: 'a', label: () => 'Вариант А' },
					{ value: 'b', label: () => 'Вариант Б' },
				],
				default: 'a',
			},
			tint: { label: () => 'Оттенок', type: 'color' as const },
			size: { label: () => 'Размер', type: 'number' as const },
			mode2: { label: () => 'Режим 2', type: 'select' as const },
			caption: { label: () => 'Заголовок', type: 'text' as const },
		},
	}
	const loose = { label: () => 'Без размера', paletteGroup: 'my-group' }
	const sized = { ...widget, label: () => 'Малый', size: { width: 100, height: 40 }, props: undefined }
	const nodeKinds = { ...flowServices.nodeKinds, widget, sized, loose: { ...service, ...loose, size: undefined } }
	return { ...flowServices, id: 'props-demo', nodeKinds }
}

export function bareNotation(rules: Record<string, unknown> = {}) {
	const { flowServices } = servicesModule
	return {
		...flowServices,
		id: 'bare',
		layout: undefined,
		groupKinds: undefined,
		rulesSummary: undefined,
		rules: { ...flowServices.rules, ...rules },
	}
}
