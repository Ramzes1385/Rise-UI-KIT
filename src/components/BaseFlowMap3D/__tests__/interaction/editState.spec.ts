import { render } from '@testing-library/vue'
import { defineComponent, nextTick, ref } from 'vue'
import { useEdit3DState } from '../../model/edit/useEdit3DState'
import { useEdit3DPointer } from '../../model/edit/useEdit3DPointer'
import { useEdit3DPanels } from '../../model/edit/panels/useEdit3DPanels'

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

function coreOf(nodes: Array<[string, Record<string, unknown>]> = [], selection: string[] = []) {
	return {
		model: {
			selection: ref(selection),
			graph: ref({ nodes: new Map(nodes), groups: new Map([['g', { label: 'Зона' }]]) }),
			history: { list: () => [], state: ref({ canUndo: false, canRedo: false, undoLabel: undefined }) },
			controller: { on: () => () => undefined },
			layout: ref({ nodes: {} }),
			nodeKind: () => ({ label: () => 'Сервис' }),
		},
		view: { isEditIn3D: ref(true) },
		announce: vi.fn(),
	}
}

describe('useEdit3DState', () => {
	afterEach(() => vi.useRealTimers())

	it('уведомление гаснет через 4 секунды; выбор узла идёт через указатель', () => {
		vi.useFakeTimers()
		const pick = vi.fn()
		const core = coreOf()
		const state = insideComponent(() => useEdit3DState({ core, focused: ref(null) } as never, {} as never, { pick: { pick } } as never))
		state.notify({ text: 'Готово', kind: 'info' } as never)
		expect(state.notice.value?.text).toBe('Готово')
		expect(core.announce).toHaveBeenCalledWith('Готово')
		vi.advanceTimersByTime(4000)
		expect(state.notice.value).toBeNull()
		state.pickNode('a')
		expect(pick).toHaveBeenCalledWith({ entity: 'node', id: 'a' })
	})
})

describe('useEdit3DPanels', () => {
	it('без выбора панели пусты; узел без группы получает пустую подпись группы', () => {
		const core = coreOf([['a', { id: 'a', label: 'А', kind: 'service' }]])
		const edit = {
			selection: ref<string[]>([]),
			palette: { currentTitle: ref(''), keyOf: () => 'service', groups: ref([]), url: ref(''), isOpen: ref(false) },
			history: ref({}),
			inspectorFocus: ref(0),
			tool: ref('select'),
			connect: { refusal: ref('') },
		}
		const panels = useEdit3DPanels({ core } as never, edit as never, (() => 'x') as never)
		expect(panels.inspector.value.node).toBeNull()
		edit.selection.value = ['a']
		expect(panels.inspector.value.groupLabel).toBe('')
		expect(panels.inspector.value.node?.id).toBe('a')
		edit.selection.value = ['gone']
		expect(panels.inspector.value.node).toBeNull()
	})

	it('группа, которой нет в графе, даёт пустую подпись', () => {
		const core = coreOf([['a', { id: 'a', label: 'А', kind: 'service', group: 'нет' }]], ['a'])
		const edit = {
			selection: ref<string[]>(['a']),
			palette: { currentTitle: ref(''), keyOf: () => 'service', groups: ref([]), url: ref(''), isOpen: ref(false) },
			history: ref({}),
			inspectorFocus: ref(0),
			tool: ref('select'),
			connect: { refusal: ref('') },
		}
		const panels = useEdit3DPanels({ core } as never, edit as never, (() => 'x') as never)
		expect(panels.inspector.value.groupLabel).toBe('')
	})
})

function pointerSetup(options: { targets?: string[]; selected?: string[]; isActive?: boolean } = {}) {
	const host = document.createElement('div')
	const canvas = document.createElement('canvas')
	const tag = document.createElement('span')
	tag.setAttribute('data-label-id', 'a')
	host.append(canvas, tag)
	document.body.append(host)
	const tool = ref<'select' | 'link'>('select')
	const state = {
		isActive: ref(options.isActive ?? true),
		tool,
		targets: () => options.targets ?? [],
		selected: () => options.selected ?? [],
		pickNode: vi.fn(),
	}
	const drag = { begin: vi.fn(), consumeClick: vi.fn(() => false) }
	const connect = { clear: vi.fn(), aim: vi.fn(), commit: vi.fn(() => Promise.resolve(true)), track: vi.fn() }
	const announce = vi.fn()
	const stage = {
		scene: { content: ref(null) },
		viewport: { camera: ref(null) },
		camera: { setOrbit: vi.fn() },
	}
	const parts = {
		refs: { viewportRef: ref(host) },
		core: { announce, model: { graph: ref({ nodes: new Map([['a', { label: 'Узел А' }]]) }) } },
	}
	const pointer = insideComponent(() => useEdit3DPointer({ parts, stage, state, drag, connect } as never))
	return { pointer, state, drag, connect, announce, host, canvas, tag, tool, stage }
}

describe('useEdit3DPointer', () => {
	it('смена инструмента: тот же, связь без цели, начало связи и выход', () => {
		const idle = pointerSetup()
		idle.pointer.setTool('select')
		idle.pointer.setTool('link')
		expect(idle.tool.value).toBe('select')
		expect(idle.announce).not.toHaveBeenCalled()
		const run = pointerSetup({ targets: ['a'] })
		run.pointer.setTool('link')
		expect(run.tool.value).toBe('link')
		expect(run.state.pickNode).toHaveBeenCalledWith('a')
		expect(run.announce).toHaveBeenCalledWith(expect.stringContaining('Узел А'))
		run.pointer.toggleLink()
		expect(run.tool.value).toBe('select')
		expect(run.connect.clear).toHaveBeenCalled()
		const unknown = pointerSetup({ targets: ['zz'], selected: ['zz'] })
		unknown.pointer.toggleLink()
		expect(unknown.state.pickNode).not.toHaveBeenCalled()
		expect(unknown.announce).toHaveBeenCalledWith(expect.stringContaining('zz'))
	})

	it('guardClick: вне правки и при обычном выборе пропускает, после переноса и в режиме связи глушит', () => {
		const run = pointerSetup({ targets: ['a'] })
		const handler = vi.fn()
		const guarded = run.pointer.guardClick(handler)
		guarded(new MouseEvent('click'))
		run.drag.consumeClick.mockReturnValueOnce(true)
		guarded(new MouseEvent('click'))
		run.tool.value = 'link'
		guarded(new MouseEvent('click'))
		run.state.isActive.value = false
		guarded(new MouseEvent('click'))
		expect(handler).toHaveBeenCalledTimes(2)
	})

	it('нажатие на сцену без узла ничего не начинает; отпускание вне режима связи связь не создаёт', async () => {
		const run = pointerSetup({ targets: ['a'], selected: ['a'] })
		await nextTick()
		run.canvas.dispatchEvent(Object.assign(new MouseEvent('pointerdown', { bubbles: true }), { isPrimary: true }))
		expect(run.drag.begin).not.toHaveBeenCalled()
		run.pointer.setTool('link')
		const down = Object.assign(new MouseEvent('pointerdown', { bubbles: true }), { isPrimary: true })
		run.tag.dispatchEvent(down)
		run.tool.value = 'select'
		window.dispatchEvent(new MouseEvent('pointerup'))
		await nextTick()
		expect(run.connect.commit).not.toHaveBeenCalled()
		expect(run.stage.camera.setOrbit).toHaveBeenCalledWith(true)
	})
})
