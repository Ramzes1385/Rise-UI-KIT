import { render } from '@testing-library/vue'
import { defineComponent, nextTick, ref } from 'vue'
import { useFlowMap3DView } from '../../model/view/useFlowMap3DView'
import { useFlowMap3DBindings } from '../../model/view/useFlowMap3DBindings'
import { useFlowMap3DTransition } from '../../model/view/useFlowMap3DTransition'
import { useFlowInspector3DSlot } from '../../model/edit/panels/useFlowInspector3DSlot'
import { useFlowMap3DContext, useFlowMap3DFrame } from '../../model/view/useFlowMap3DContext'

function insideComponent<T>(setup: () => T): T {
	let result!: T
	render(
		defineComponent({
			setup() {
				result = setup()
				return () => null
			},
		}),
	)
	return result
}

describe('useFlowMap3DBindings', () => {
	it('режим от 2D-карты переключает «Правку» только для `edit`', () => {
		const setMode = vi.fn()
		const bindings = useFlowMap3DBindings({
			props: {},
			emit: vi.fn(),
			model: { data: ref({}), selection: ref([]), controller: { select: vi.fn() } },
			view: { mode: ref('view'), setMode },
			track: { viewport: vi.fn(), ready: vi.fn() },
		} as never)
		const handler = bindings.value['onUpdate:mode'] as (mode: string) => void
		handler('edit')
		handler('что-то')
		expect(setMode.mock.calls).toEqual([['edit'], ['view']])
	})
})

describe('useFlowMap3DContext', () => {
	it('без корня или ResizeObserver размер не отслеживается', () => {
		const frame = insideComponent(() => useFlowMap3DFrame({ compactBreakpoint: 640 }, { value: null }))
		expect(frame.isCompact.value).toBe(false)
		expect(frame.isNarrow.value).toBe(false)
	})

	it('без своего порога узкой считается карта уже 640 px', () => {
		const root = document.createElement('div')
		Object.defineProperty(root, 'clientWidth', { value: 500 })
		vi.stubGlobal(
			'ResizeObserver',
			class {
				observe = vi.fn()
				disconnect = vi.fn()
			},
		)
		const frame = insideComponent(() => useFlowMap3DFrame({} as never, { value: root }))
		expect(frame.isCompact.value).toBe(true)
		vi.unstubAllGlobals()
	})

	it('контекст передаёт положение камере', () => {
		const setViewport = vi.fn()
		const context = insideComponent(() =>
			useFlowMap3DContext({
				model: { events: { emit: vi.fn() } },
				camera: { viewport: () => ({ x: 0, y: 0, zoom: 1 }), setViewport },
				state: { frame: ref({ width: 1, height: 1 }), isCompact: ref(false) },
				onFrame: () => () => undefined,
				focused: ref(null),
				hovered: ref(null),
				isReducedMotion: ref(false),
				isVisible: ref(true),
				announce: vi.fn(),
			} as never),
		)
		context.setViewport({ x: 1, y: 2, zoom: 3 }, { animate: false } as never)
		expect(setViewport).toHaveBeenCalledWith({ x: 1, y: 2, zoom: 3 }, { animate: false })
	})
})

describe('useFlowMap3DTransition', () => {
	it('возврат в 3D без запомненного положения камеру не двигает, но сообщает о возврате', async () => {
		const shownView = ref<'2d' | '3d'>('2d')
		const setViewport = vi.fn()
		const onReturn = vi.fn()
		insideComponent(() =>
			useFlowMap3DTransition({ shownView, camera: { viewport: () => ({ x: 0, y: 0, zoom: 1 }), setViewport }, onReturn } as never),
		)
		shownView.value = '3d'
		await nextTick()
		await nextTick()
		await nextTick()
		expect(setViewport).not.toHaveBeenCalled()
		expect(onReturn).toHaveBeenCalled()
	})
})

describe('useFlowMap3DView', () => {
	it('повторный выбор того же режима событие не посылает', () => {
		const emit = vi.fn()
		const state = insideComponent(() =>
			useFlowMap3DView({ props: { view: '3d', mode: 'view', data: {} }, emit, isNarrow: () => false } as never),
		)
		state.setMode('view')
		expect(emit).not.toHaveBeenCalled()
		state.setMode('edit')
		expect(emit).toHaveBeenCalledWith('update:mode', 'edit')
	})
})

describe('useFlowInspector3DSlot', () => {
	function slot(target: { entity: string; id: string }, nodes: Array<Record<string, unknown>>) {
		const updateNode = vi.fn()
		const props = {
			target,
			controller: { getData: () => ({ nodes }), updateNode },
			modelInfo: () => ({ title: 'Сервис', key: 'service' }),
			rectOf: () => undefined,
		}
		return { updateNode, ...useFlowInspector3DSlot(props as never) }
	}

	it('для узла правит 3D-поля; сброс цвета убирает tint', () => {
		const run = slot({ entity: 'node', id: 'a' }, [{ id: 'a', model3d: { rotation: 90, tint: 'red' } }])
		run.rotate()
		run.tint(null)
		run.scale(2)
		run.elevation(1)
		expect(run.updateNode).toHaveBeenCalledTimes(4)
		expect(run.updateNode.mock.calls[0][1].model3d.rotation).toBe(180)
		expect(run.updateNode.mock.calls[1][1].model3d.tint).toBeUndefined()
		expect(run.rect.value).toBeUndefined()
	})

	it('для связи или неизвестного узла ничего не правит', () => {
		const edge = slot({ entity: 'edge', id: 'e' }, [{ id: 'e' }])
		expect(edge.node.value).toBeUndefined()
		edge.rotate()
		const missing = slot({ entity: 'node', id: 'nope' }, [])
		missing.tint('red')
		expect(edge.updateNode).not.toHaveBeenCalled()
		expect(missing.updateNode).not.toHaveBeenCalled()
	})
})
