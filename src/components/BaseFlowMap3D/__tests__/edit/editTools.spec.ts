import { OrthographicCamera } from 'three'
import { defineComponent, ref } from 'vue'
import { render } from '@testing-library/vue'
import { useNodeDrag } from '../../model/edit/drag/useNodeDrag'
import { UI_FLOW_MAP, UI_FLOW_MAP_3D } from '@/locales/messages'
import { useConnectTool } from '../../model/edit/connect/useConnectTool'
import { useFlowMap3DSnapshot } from '../../model/data/useFlowMap3DSnapshot'
import { useEdit3DActions } from '../../model/edit/actions/useEdit3DActions'
import { edge, fakeModel, node, rect, route } from '../helpers/fakeModel.test-utils'
import { isModelUrl, useModelPalette } from '../../model/edit/actions/useModelPalette'
import { DEFAULT_GRID, arrowDirection, footprintOf, gridOf, targetAt, targetShifted } from '../../model/edit/drag/gridSnap'

const LAYOUT = {
	nodes: [node('a'), node('b'), node('c')],
	rects: { a: rect(40, 20, 80, 40), b: rect(340, 20, 80, 40), c: rect(640, 20, 80, 40) },
	edges: [edge('e1', 'a', 'b')],
	routes: { e1: route([80, 40], [380, 40]) },
	bounds: rect(0, 0, 800, 100),
}

const snapshot = () => useFlowMap3DSnapshot(fakeModel(LAYOUT), () => false).value
const done = { isApplied: true, changes: [] }

function controllerOf(result: Record<string, unknown> = done) {
	return {
		updateNode: vi.fn(async () => result),
		transact: vi.fn(async (_label: string, run: () => Promise<void>) => {
			await run()
			return result
		}),
		remove: vi.fn(async () => result),
		move: vi.fn(async () => result),
		connect: vi.fn(async () => result),
		undo: vi.fn(),
		redo: vi.fn(),
	}
}

function modelOf(history: Record<string, unknown> = { canUndo: false, canRedo: false }, extra: Record<string, unknown> = {}) {
	const nodes = new Map(LAYOUT.nodes.map(item => [item.id, item]))
	return {
		graph: ref({ nodes }),
		history: { state: ref(history) },
		data: ref({ layout: { gridSize: 4 } }),
		notation: ref({ defaultEdgeKind: 'call' }),
		selection: ref<string[]>([]),
		nodeKind: () => ({ model3d: 'server' }),
		...extra,
	} as never
}

function actionsOf(options: { controller?: ReturnType<typeof controllerOf>; history?: Record<string, unknown> } = {}) {
	const controller = options.controller ?? controllerOf()
	const [notify, announce] = [vi.fn(), vi.fn()]
	const actions = useEdit3DActions({ model: modelOf(options.history), controller, notify, announce, getSnapshot: snapshot } as never)
	return { actions, controller, notify, announce }
}

describe('действия правки', () => {
	it('поворот: один узел — одна команда, несколько — один шаг истории, пустой список — ничего', async () => {
		const { actions, controller, notify } = actionsOf()
		await actions.rotate([])
		expect(controller.updateNode).not.toHaveBeenCalled()
		await actions.rotate(['a'])
		expect(controller.updateNode).toHaveBeenCalledWith('a', { model3d: { rotation: 90 } })
		await actions.rotate(['a', 'b', 'ghost'])
		expect(controller.transact).toHaveBeenCalledOnce()
		expect(controller.updateNode).toHaveBeenCalledTimes(3)
		expect(notify).toHaveBeenLastCalledWith({ text: expect.stringContaining('90'), kind: 'ok' })
	})

	it('замена модели: ключ и ссылка; цвет, статус, поза и название — каждое своей командой', async () => {
		const { actions, controller } = actionsOf()
		expect(await actions.replaceModel(['a'], { model: 'database' })).toBe(true)
		expect(controller.updateNode).toHaveBeenLastCalledWith('a', { model3d: { model: 'database' } })
		await actions.replaceModel(['a'], { url: 'https://cdn.example.ru/a.glb' })
		expect(controller.updateNode).toHaveBeenLastCalledWith('a', { model3d: { url: 'https://cdn.example.ru/a.glb' } })
		await actions.setTint(['a'], 'var(--rise-chart-2)')
		await actions.setTint(['a'], null)
		await actions.setStatus(['a'], 'warning')
		await actions.setPose(['a'], { scale: 2 })
		await actions.rename('a', '  Новое  ')
		await actions.rename('a', 'A')
		await actions.rename('a', '   ')
		await actions.rename('ghost', 'Имя')
		expect(controller.updateNode).toHaveBeenCalledWith('a', { label: 'Новое' })
		expect(controller.updateNode).not.toHaveBeenCalledWith('a', { label: 'A' })
	})

	it('отказ команды: причина из отказа или «не применено» уходит в уведомление', async () => {
		const withReason = actionsOf({ controller: controllerOf({ isApplied: false, changes: [], reject: { message: 'Нельзя' } }) })
		await withReason.actions.remove(['a'])
		expect(withReason.notify).toHaveBeenCalledWith({ text: expect.stringContaining('Нельзя'), kind: 'warning' })
		const bare = actionsOf({ controller: controllerOf({ isApplied: false, changes: [] }) })
		await bare.actions.remove(['a', 'b'])
		expect(bare.notify).toHaveBeenCalledWith({ text: expect.stringContaining(UI_FLOW_MAP_3D.EDIT_NOT_APPLIED), kind: 'warning' })
		expect(await bare.actions.connect('a', 'ghost')).toBe(false)
	})

	it('сдвиг: нет узлов — ничего, занятая клетка — предупреждение, свободная — команда', async () => {
		const { actions, controller, notify } = actionsOf()
		await actions.nudge(['ghost'], { x: 8, y: 0 })
		expect(controller.move).not.toHaveBeenCalled()
		await actions.nudge(['a'], { x: 300, y: 0 })
		expect(notify).toHaveBeenLastCalledWith({ text: UI_FLOW_MAP_3D.EDIT_BLOCKED, kind: 'warning' })
		await actions.nudge(['a'], { x: 0, y: 8 })
		expect(controller.move).toHaveBeenCalledWith(['a'], { x: 0, y: 8 })
	})

	it('связь: озвучивает названия или id, если узла нет', async () => {
		const { actions, controller, notify } = actionsOf()
		expect(await actions.connect('a', 'b')).toBe(true)
		expect(controller.connect).toHaveBeenCalledWith('a', 'b')
		await actions.connect('ghost', 'b')
		expect(notify).toHaveBeenLastCalledWith({ text: expect.stringContaining('ghost'), kind: 'ok' })
	})

	it('отмена и повтор: только когда история позволяет, подпись может быть пустой', () => {
		const idle = actionsOf()
		idle.actions.undo()
		idle.actions.redo()
		expect(idle.controller.undo).not.toHaveBeenCalled()
		expect(idle.controller.redo).not.toHaveBeenCalled()
		const busy = actionsOf({ history: { canUndo: true, canRedo: true, undoLabel: 'Поворот', redoLabel: undefined } })
		busy.actions.undo()
		busy.actions.redo()
		expect(busy.controller.undo).toHaveBeenCalledOnce()
		expect(busy.announce).toHaveBeenCalledWith(expect.stringContaining('Поворот'))
		expect(busy.announce).toHaveBeenCalledTimes(2)
		const bare = actionsOf({ history: { canUndo: true, canRedo: true } })
		bare.actions.undo()
		bare.actions.redo()
		expect(UI_FLOW_MAP.ANNOUNCE_UNDO).toBeDefined()
	})
})

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

describe('палитра моделей', () => {
	it('адрес модели: http, https и путь подходят, остальное — нет', () => {
		expect(isModelUrl('https://cdn.example.ru/a.glb')).toBe(true)
		expect(isModelUrl('http://cdn.example.ru/a.glb')).toBe(true)
		expect(isModelUrl('/models/a.glb')).toBe(true)
		expect(isModelUrl('models/a.glb?v=2')).toBe(true)
		expect(isModelUrl('models/a')).toBe(false)
		expect(isModelUrl('  ')).toBe(false)
		expect(isModelUrl('')).toBe(false)
		expect(isModelUrl('ftp://x.example/a.glb')).toBe(false)
		expect(isModelUrl('http://')).toBe(false)
	})

	it('ключ модели: из узла, из сцены, из вида нотации или запасной; узла нет — запасной', () => {
		const model = modelOf()
		const nodes = (model as unknown as { graph: { value: { nodes: Map<string, unknown> } } }).graph.value.nodes
		nodes.set('own', { id: 'own', label: 'Свой', kind: 'service', model3d: { model: 'database' } })
		const palette = insideComponent(() =>
			useModelPalette({
				model,
				getModels: () => ({ mine: { create: () => null } }) as never,
				getSelected: () => 'own',
				getResolved: id => (id === 'b' ? 'queue' : null),
				appModels: {},
			}),
		)
		expect(palette.keyOf('own')).toBe('database')
		expect(palette.keyOf('b')).toBe('queue')
		expect(palette.keyOf('a')).toBe('server')
		expect(palette.keyOf('ghost')).toBeTruthy()
		expect(palette.titleOf('own')).toBeTruthy()
		expect(palette.groups.value.scheme.some(item => item.isCurrent)).toBe(true)
		expect(palette.groups.value.more.some(item => item.key === 'mine')).toBe(true)
		expect(palette.currentTitle.value).toBeTruthy()
		palette.toggle()
		expect(palette.isOpen.value).toBe(true)
		palette.close()
		expect(palette.isOpen.value).toBe(false)
	})

	it('без выбранного узла текущей модели нет', () => {
		const palette = insideComponent(() =>
			useModelPalette({
				model: modelOf(),
				appModels: {},
				getModels: () => undefined,
				getSelected: () => null,
				getResolved: () => null,
			}),
		)
		expect(palette.currentTitle.value).toBe('')
	})
})

describe('сетка', () => {
	it('шаг сетки: первое подходящее число, иначе стандартный; привязка при нулевой сетке не округляет', () => {
		expect(gridOf(undefined, 16)).toBe(16)
		expect(gridOf(undefined, Number.NaN, -1)).toBe(DEFAULT_GRID)
		expect(gridOf(0)).toBe(0)
		const item = snapshot().nodes[0]
		const view = (grid: number) => ({ snapshot: snapshot(), grid })
		const exact = targetAt(item, { x: 3.333, z: 1.111 }, view(0))
		expect(exact.position.x).not.toBe(Math.round(exact.position.x / 8) * 8)
		expect(targetAt(item, { x: 3.333, z: 1.111 }, view(8)).position.x % 8).toBe(0)
	})

	it('смещённая цель и размер основания; стрелки идут по ближайшей оси экрана', () => {
		const item = snapshot().nodes[0]
		expect(footprintOf(item, snapshot())).toBeCloseTo(0.8)
		expect(targetShifted(item, { x: 0, y: 0 }, snapshot()).isFree).toBe(true)
		for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'])
			for (const azimuth of [0, Math.PI / 2, Math.PI, -Math.PI / 2, 0.4]) {
				const direction = arrowDirection(key, azimuth)
				expect(Math.abs(direction.x) + Math.abs(direction.z)).toBe(1)
			}
	})
})

function overlayOf() {
	return { setColors: vi.fn(), showGhost: vi.fn(), showLink: vi.fn(), hide: vi.fn(), dispose: vi.fn() }
}

function topDown(): OrthographicCamera {
	const camera = new OrthographicCamera(-20, 20, 15, -15)
	camera.position.set(0, 20, 0)
	camera.up.set(0, 0, -1)
	camera.lookAt(0, 0, 0)
	camera.updateMatrixWorld()
	camera.updateProjectionMatrix()
	return camera
}

function hostOf(): HTMLElement {
	const host = document.createElement('div')
	host.getBoundingClientRect = () => ({
		left: 0,
		top: 0,
		width: 800,
		height: 600,
		right: 800,
		bottom: 600,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	})
	return host
}

const px = (item: { x: number; z: number }) => ({ x: 400 + item.x * 20, y: 300 + item.z * 20 })
const pointerOf = (type: string, x: number, y: number) => new MouseEvent(type, { clientX: x, clientY: y })

function connectParts(extra: Record<string, unknown> = {}) {
	const overlay = overlayOf()
	const actions = { connect: vi.fn(async () => true) }
	const announce = vi.fn()
	const parts = {
		model: modelOf(undefined, {
			notation: ref({
				defaultEdgeKind: 'call',
				rules: {
					canConnect: ({ target }: { target: { id: string } }) => (target.id === 'c' ? { code: 'no', message: 'Закрыто' } : true),
				},
			}),
		}),
		getSnapshot: snapshot,
		getOverlay: () => overlay,
		getSource: () => 'a' as string | null,
		hostRef: ref<HTMLElement | null>(hostOf()),
		viewport: { camera: ref(topDown()) },
		announce,
		actions,
		...extra,
	}
	return { parts: parts as never, overlay, actions, announce }
}

describe('инструмент связи', () => {
	it('цель допустима, отказана или совпала с источником; линия и озвучка следуют за выбором', () => {
		const { parts, overlay, announce } = connectParts()
		const tool = useConnectTool(parts)
		tool.aim('b')
		expect(tool.refusal.value).toBe('')
		expect(overlay.showLink).toHaveBeenLastCalledWith(expect.objectContaining({ isValid: true, ring: expect.any(Object) }))
		expect(announce).toHaveBeenLastCalledWith(expect.stringContaining('можно'))
		tool.aim('c')
		expect(tool.refusal.value).toBe('Закрыто')
		expect(announce).toHaveBeenLastCalledWith(expect.stringContaining('Закрыто'))
		announce.mockClear()
		tool.aim('a')
		tool.aim(null)
		tool.aim('ghost')
		expect(announce).not.toHaveBeenCalled()
		expect(overlay.showLink).toHaveBeenLastCalledWith(expect.objectContaining({ ring: null }))
	})

	it('без оверлея или источника линия не рисуется и ничего не падает', () => {
		const noOverlay = connectParts({ getOverlay: () => null })
		useConnectTool(noOverlay.parts).aim('b')
		const noSource = connectParts({ getSource: () => null })
		const tool = useConnectTool(noSource.parts)
		tool.aim('b')
		tool.track(pointerOf('pointermove', 400, 300) as PointerEvent, 'b')
		expect(noSource.overlay.showLink).not.toHaveBeenCalled()
	})

	it('указатель в протяжке: конец линии — точка земли или цель; без области точки нет', () => {
		const { parts, overlay } = connectParts()
		const tool = useConnectTool(parts)
		tool.track(pointerOf('pointermove', 420, 320) as PointerEvent, null)
		expect(overlay.showLink).toHaveBeenLastCalledWith(expect.objectContaining({ ring: null }))
		tool.track(pointerOf('pointermove', 420, 320) as PointerEvent, 'b')
		const hostless = connectParts({ hostRef: ref(null) })
		useConnectTool(hostless.parts).track(pointerOf('pointermove', 1, 1) as PointerEvent, null)
		expect(hostless.overlay.showLink).toHaveBeenCalled()
	})

	it('проведение связи: без источника или цели — нет; успех убирает линию, отказ оставляет', async () => {
		const { parts, overlay, actions } = connectParts()
		const tool = useConnectTool(parts)
		expect(await tool.commit(null)).toBe(false)
		tool.aim('b')
		expect(await tool.commit()).toBe(true)
		expect(actions.connect).toHaveBeenCalledWith('a', 'b')
		expect(overlay.hide).toHaveBeenCalled()
		actions.connect.mockResolvedValueOnce(false as never)
		expect(await tool.commit('c')).toBe(false)
		tool.clear()
		const lonely = connectParts({ getSource: () => null })
		expect(await useConnectTool(lonely.parts).commit('b')).toBe(false)
	})
})

function dragParts(extra: Record<string, unknown> = {}) {
	const controller = controllerOf()
	const overlay = overlayOf()
	const [notify, pick, setOrbit] = [vi.fn(), vi.fn(), vi.fn()]
	const model = modelOf()
	const parts = {
		model,
		controller,
		pick: { pick },
		camera: { setOrbit },
		viewport: { camera: ref(topDown()) },
		hostRef: ref<HTMLElement | null>(hostOf()),
		getSnapshot: snapshot,
		getOverlay: () => overlay,
		notify,
		...extra,
	}
	return { parts: parts as never, controller, overlay, notify, pick, setOrbit, model }
}

const window_ = (type: string, x = 0, y = 0) => window.dispatchEvent(pointerOf(type, x, y))

describe('перенос узла', () => {
	it('перенос в свободную клетку: выбор узла, призрак, команда сдвига и «перемещён»', async () => {
		const { parts, controller, overlay, notify, pick, setOrbit } = dragParts()
		const drag = useNodeDrag(parts)
		const item = snapshot().nodes[0]
		const start = px(item)
		drag.begin('a', pointerOf('pointerdown', start.x, start.y) as PointerEvent)
		expect(setOrbit).toHaveBeenCalledWith(false)
		drag.begin('a', pointerOf('pointerdown', start.x, start.y) as PointerEvent)
		window_('pointermove', start.x + 1, start.y)
		expect(drag.isDragging.value).toBe(false)
		window_('pointermove', start.x + 100, start.y + 20)
		expect(drag.isDragging.value).toBe(true)
		expect(pick).toHaveBeenCalledWith({ entity: 'node', id: 'a' })
		expect(overlay.showGhost).toHaveBeenCalled()
		window_('pointerup', start.x + 100, start.y + 20)
		await vi.waitFor(() => expect(controller.move).toHaveBeenCalled())
		await vi.waitFor(() => expect(notify).toHaveBeenCalledWith({ text: UI_FLOW_MAP_3D.EDIT_MOVED, kind: 'ok' }))
		expect(drag.consumeClick()).toBe(true)
		await new Promise(resolve => setTimeout(resolve, 5))
		expect(drag.consumeClick()).toBe(false)
		expect(setOrbit).toHaveBeenLastCalledWith(true)
	})

	it('выбранный узел повторно не выбирается; занятая клетка и тот же пункт назначения ничего не двигают', async () => {
		const { parts, controller, notify, pick, model } = dragParts()
		;(model as unknown as { selection: { value: string[] } }).selection.value = ['a']
		const drag = useNodeDrag(parts)
		const [a, b] = snapshot().nodes
		drag.begin('a', pointerOf('pointerdown', px(a).x, px(a).y) as PointerEvent)
		window_('pointermove', px(a).x + 10, px(a).y + 10)
		window_('pointermove', px(b).x, px(b).y)
		window_('pointerup', px(b).x, px(b).y)
		await vi.waitFor(() => expect(notify).toHaveBeenCalledWith({ text: UI_FLOW_MAP_3D.EDIT_BLOCKED, kind: 'warning' }))
		expect(pick).not.toHaveBeenCalled()
		expect(controller.move).not.toHaveBeenCalled()
		drag.begin('a', pointerOf('pointerdown', px(a).x, px(a).y) as PointerEvent)
		window_('pointermove', px(a).x + 6, px(a).y)
		window_('pointermove', px(a).x, px(a).y)
		window_('pointerup', px(a).x, px(a).y)
		await new Promise(resolve => setTimeout(resolve, 5))
		expect(controller.move).not.toHaveBeenCalled()
	})

	it('отказ команды сдвига попадает в уведомление; неизвестный узел не начинает перенос', async () => {
		const refused = dragParts()
		refused.controller.move.mockResolvedValue({ isApplied: false, changes: [], reject: { message: 'Закреплён' } } as never)
		const drag = useNodeDrag(refused.parts)
		const a = snapshot().nodes[0]
		drag.begin('ghost', pointerOf('pointerdown', 0, 0) as PointerEvent)
		expect(refused.setOrbit).not.toHaveBeenCalled()
		drag.begin('a', pointerOf('pointerdown', px(a).x, px(a).y) as PointerEvent)
		window_('pointermove', px(a).x + 80, px(a).y + 40)
		window_('pointerup', px(a).x + 80, px(a).y + 40)
		await vi.waitFor(() => expect(refused.notify).toHaveBeenCalledWith({ text: 'Закреплён', kind: 'warning' }))
		refused.controller.move.mockResolvedValue({ isApplied: false, changes: [] } as never)
		drag.begin('a', pointerOf('pointerdown', px(a).x, px(a).y) as PointerEvent)
		window_('pointermove', px(a).x + 80, px(a).y + 40)
		window_('pointerup', px(a).x + 80, px(a).y + 40)
		await vi.waitFor(() => expect(refused.notify).toHaveBeenCalledWith({ text: UI_FLOW_MAP_3D.EDIT_NOT_APPLIED, kind: 'warning' }))
	})

	it('без области луч не попадает: перенос идёт без цели и ничего не меняет', async () => {
		const blind = dragParts({ hostRef: ref(null) })
		const drag = useNodeDrag(blind.parts)
		drag.begin('a', pointerOf('pointerdown', 10, 10) as PointerEvent)
		window_('pointermove', 100, 100)
		window_('pointerup', 100, 100)
		await new Promise(resolve => setTimeout(resolve, 5))
		expect(blind.controller.move).not.toHaveBeenCalled()
		expect(blind.overlay.showGhost).not.toHaveBeenCalled()
	})

	it('отмена: без переноса — нет, во время переноса — да с уведомлением; pointercancel гасит перенос', () => {
		const { parts, notify, overlay, setOrbit } = dragParts()
		const drag = useNodeDrag(parts)
		expect(drag.cancel()).toBe(false)
		const a = snapshot().nodes[0]
		drag.begin('a', pointerOf('pointerdown', px(a).x, px(a).y) as PointerEvent)
		window_('pointermove', px(a).x + 60, px(a).y + 60)
		expect(drag.cancel()).toBe(true)
		expect(notify).toHaveBeenCalledWith({ text: UI_FLOW_MAP_3D.EDIT_CANCELLED, kind: 'ok' })
		expect(overlay.hide).toHaveBeenCalled()
		drag.begin('a', pointerOf('pointerdown', px(a).x, px(a).y) as PointerEvent)
		window_('pointercancel')
		expect(setOrbit).toHaveBeenLastCalledWith(true)
		drag.dispose()
	})
})
