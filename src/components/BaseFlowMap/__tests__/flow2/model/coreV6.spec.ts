import { defineComponent, h } from 'vue'
import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'
import { createScope } from '../fixtures/flow2Scope'
import { edgeSample } from '../../../model/panels/legendRows'
import { edge, group, map, node } from '../fixtures/flow2Data'
import { useFlowFrame } from '../../../model/viewport/useFlowFrame'
import { createLayoutInput } from '../../../model/layout/flowLayoutInput'
import { fitViewport, NO_INSETS } from '../../../model/viewport/viewGeometry'
import type { FlowLegendRow } from '../../../types/internal/flowPanels.types'
import { collectMarkers, endMarkerOf } from '../../../model/render/flowMarkers'

const LIMITS = { min: 0.2, max: 3 }

describe('fitViewport с отступами под оверлеи', () => {
	const bounds = { x: 0, y: 0, width: 400, height: 200 }
	const frame = { width: 1000, height: 500 }

	it('без отступов центрирует по всему кадру', () => {
		const view = fitViewport(bounds, frame, { padding: 32, limits: LIMITS })
		expect(view).toEqual({ zoom: 1, x: 300, y: 150 })
		expect(fitViewport(bounds, frame, { padding: 32, limits: LIMITS, insets: NO_INSETS })).toEqual(view)
	})

	it('правый отступ сдвигает содержимое влево — центр в свободной области', () => {
		const view = fitViewport(bounds, frame, { padding: 32, limits: LIMITS, insets: { ...NO_INSETS, right: 300 } })
		expect(view.zoom).toBe(1)
		expect(view.x + 200).toBeCloseTo(350)
	})

	it('левый и верхний отступы смещают свободную область', () => {
		const view = fitViewport(bounds, frame, { padding: 32, limits: LIMITS, insets: { top: 100, right: 0, bottom: 0, left: 200 } })
		expect(view.x + 200).toBeCloseTo(200 + 400)
		expect(view.y + 100).toBeCloseTo(100 + 200)
	})

	it('узкая свободная область уменьшает масштаб', () => {
		const view = fitViewport(bounds, frame, { padding: 32, limits: LIMITS, insets: { ...NO_INSETS, right: 700 } })
		expect(view.zoom).toBeCloseTo((300 - 64) / 400)
	})

	it('отступы, съедающие весь кадр, игнорируются: вписывание по полному кадру', () => {
		const wide = fitViewport(bounds, frame, { padding: 32, limits: LIMITS, insets: { ...NO_INSETS, right: 990 } })
		expect(wide).toEqual(fitViewport(bounds, frame, { padding: 32, limits: LIMITS }))
		const tall = fitViewport(bounds, frame, { padding: 32, limits: LIMITS, insets: { ...NO_INSETS, top: 480 } })
		expect(tall).toEqual(wide)
	})
})

describe('useFlowFrame.insets: легенда и мини-карта', () => {
	function mountFrame(setup: (root: HTMLElement) => void, width = 1000) {
		const stage = document.createElement('div')
		stage.className = 'base-flow-map__stage'
		const element = document.createElement('div')
		stage.append(element)
		document.body.append(stage)
		vi.spyOn(element, 'clientWidth', 'get').mockReturnValue(width)
		vi.spyOn(element, 'clientHeight', 'get').mockReturnValue(500)
		element.getBoundingClientRect = () => ({ right: 1000, left: 0 }) as DOMRect
		setup(stage)
		let state!: ReturnType<typeof useFlowFrame>
		const Host = defineComponent({
			setup() {
				state = useFlowFrame({})
				state.attach(element)
				return () => h('div')
			},
		})
		const view = render(Host)
		return { state, stage, element, unmount: view.unmount }
	}

	function overlay(stage: HTMLElement, className: string, left: number): void {
		const item = document.createElement('div')
		item.className = className
		item.getBoundingClientRect = () => ({ left }) as DOMRect
		stage.append(item)
	}

	it('отступ справа — ширина самого широкого оверлея плюс зазор', () => {
		const { state, unmount } = mountFrame(stage => {
			overlay(stage, 'base-flow-map__legend', 800)
			overlay(stage, 'base-flow-map__minimap', 700)
		})
		expect(state.insets()).toEqual({ top: 0, right: 316, bottom: 0, left: 0 })
		unmount()
	})

	it('оверлеи вне правого края (ширина не положительна) не учитываются, но зазор остаётся', () => {
		const { state, unmount } = mountFrame(stage => overlay(stage, 'base-flow-map__legend', 1200))
		expect(state.insets().right).toBe(16)
		unmount()
	})

	it('без оверлеев отступов нет', () => {
		const { state, unmount } = mountFrame(() => undefined)
		expect(state.insets()).toEqual(NO_INSETS)
		unmount()
	})

	it('в компактном кадре отступы нулевые, даже если оверлеи есть', () => {
		const { state, unmount } = mountFrame(stage => overlay(stage, 'base-flow-map__legend', 100), 400)
		expect(state.isCompact.value).toBe(true)
		expect(state.insets()).toEqual(NO_INSETS)
		unmount()
	})

	it('без элемента и без области stage отступов нет', () => {
		let state!: ReturnType<typeof useFlowFrame>
		const Host = defineComponent({
			setup() {
				state = useFlowFrame({})
				return () => h('div')
			},
		})
		render(Host)
		expect(state.insets()).toEqual(NO_INSETS)
		const loose = document.createElement('div')
		vi.spyOn(loose, 'clientWidth', 'get').mockReturnValue(1000)
		state.attach(loose)
		expect(state.insets()).toEqual(NO_INSETS)
	})
})

describe('flowLayoutInput: контракт v6', () => {
	const scope = createScope(
		map({
			groups: [group('g', { kind: 'zone', props: { tech: 'k8s' } })],
			nodes: [node('a', { group: 'g' }), node('b')],
			edges: [edge('e1', ['a', 'b'], { kind: 'async', props: { latency: 5 } }), edge('e2', ['a', 'b'])],
		}),
	)

	it('связи несут kind (из данных или вид по умолчанию нотации) и props', () => {
		const { edges } = createLayoutInput(scope)
		expect(edges[0]).toMatchObject({ id: 'e1', kind: 'async', props: { latency: 5 } })
		expect(edges[1].kind).toBe(scope.notation.defaultEdgeKind)
		expect(edges[1].props).toBeUndefined()
	})

	it('группы несут kind и props', () => {
		const { groups } = createLayoutInput(scope)
		expect(groups[0]).toMatchObject({ id: 'g', kind: 'zone', props: { tech: 'k8s' } })
	})
})

describe('маркер cross (v6.1)', () => {
	it('концевой маркер cross — два штриха, не заполнен, и попадает в набор определений', () => {
		const marker = endMarkerOf({ label: () => 'x', stroke: 'solid', endMarker: 'cross' })
		expect(marker).toMatchObject({ id: 'cross', isFilled: false, paths: ['M1 1L9 9', 'M9 1L1 9'] })
		const found = collectMarkers([
			{ label: () => 'a', stroke: 'solid', endMarker: 'cross' },
			{ label: () => 'b', stroke: 'solid', endMarker: 'cross' },
			{ label: () => 'c', stroke: 'solid' },
		])
		expect(found.map(item => item.id)).toEqual(['cross'])
	})

	it('в легенде у связи с крестом — отметка из двух штрихов в конце линии', () => {
		const row = { id: 'x', entity: 'edge', label: 'destroy', edge: { stroke: 'solid', endMarker: 'cross' } } as FlowLegendRow
		const sample = edgeSample(row)
		expect(sample.marks).toEqual([{ path: 'M18 3.5l5 7M23 3.5l-5 7', isFilled: false }])
		expect(sample.dash).toBe('')
	})
})
