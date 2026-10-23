import { ref } from 'vue'
import { Color, OrthographicCamera, Vector3 } from 'three'
import { applyStates } from '../../model/scene/sceneStates'
import { mockWebGL } from '../helpers/flowMap3d.test-utils'
import { nodeTones, scenarioIds } from '../../model/scene/sceneTones'
import { cellPixels, isDetailShown, shadowModeOf } from '../../model/scene/sceneQuality'
import { createPalette, edgeColor, textColor, toneOf } from '../../model/scene/flowMap3dPalette'
import type { FlowMap3DContent, FlowMap3DEdgeItem, FlowMap3DSceneStates } from '../../types/internal/flowMap3dInternal.types'

describe('toneOf', () => {
	it('без статуса тона нет; встроенные статусы переводятся в тона', () => {
		expect(toneOf(undefined, undefined)).toBe('none')
		expect(toneOf('ok', undefined)).toBe('none')
		expect(toneOf('warning', undefined)).toBe('warning')
		expect(toneOf('error', undefined)).toBe('danger')
		expect(toneOf('down', undefined)).toBe('muted')
		expect(toneOf('unknown', undefined)).toBe('muted')
		expect(toneOf('beta', undefined)).toBe('info')
	})

	it('свой статус берёт тон по слову в цвете, иначе — «info»', () => {
		const defs = (color: string) => [{ id: 'mine', label: 'M', color, icon: 'info' }] as never
		expect(toneOf('mine', defs('var(--rise-success)'))).toBe('success')
		expect(toneOf('mine', defs('var(--rise-warning)'))).toBe('warning')
		expect(toneOf('mine', defs('var(--rise-error)'))).toBe('danger')
		expect(toneOf('mine', defs('var(--rise-danger)'))).toBe('danger')
		expect(toneOf('mine', defs('var(--rise-muted)'))).toBe('muted')
		expect(toneOf('mine', defs('var(--rise-dimmed)'))).toBe('muted')
		expect(toneOf('mine', defs('#123456'))).toBe('info')
		expect(toneOf('other', defs('var(--rise-error)'))).toBe('info')
	})
})

describe('палитра сцены', () => {
	beforeEach(() => mockWebGL(true))

	it('собирается из цветов хоста, текст — шестнадцатеричная строка', () => {
		const palette = createPalette(document.createElement('div'))
		expect(palette.palette.colors.line).toBeInstanceOf(Color)
		expect(textColor(palette)).toMatch(/^#[0-9a-f]{6}$/)
	})

	it('цвет связи: свой токен, пунктир или обычная линия', () => {
		const palette = createPalette(document.createElement('div'))
		const item = (extra: Partial<FlowMap3DEdgeItem>) => ({ stroke: 'solid', color: undefined, ...extra }) as FlowMap3DEdgeItem
		expect(edgeColor(item({ color: 'var(--rise-error)' }), palette)).toBeInstanceOf(Color)
		expect(edgeColor(item({ stroke: 'dashed' }), palette)).toBe(palette.palette.colors.lineAsync)
		expect(edgeColor(item({}), palette)).toBe(palette.palette.colors.line)
	})
})

describe('applyStates', () => {
	function contentOf() {
		const setState = vi.fn()
		const setHighlight = vi.fn()
		const setTones = vi.fn()
		const content = {
			nodes: {
				registry: { setState },
				entries: new Map([
					['a', {}],
					['b', {}],
				]),
			},
			setHighlight,
			particles: { setTones },
		} as unknown as FlowMap3DContent
		return { content, setState, setHighlight, setTones }
	}

	const states = (extra: Partial<FlowMap3DSceneStates> = {}): FlowMap3DSceneStates => ({
		hover: null,
		focus: null,
		selection: new Set(),
		active: new Set(),
		highlight: null,
		tones: new Map(),
		isPlaying: false,
		...extra,
	})

	it('переводит выбор, наведение, фокус, тон и подсветку в состояния моделей', () => {
		const { content, setState, setHighlight, setTones } = contentOf()
		const tones = new Map([['a', 'danger' as const]])
		applyStates(
			content,
			states({
				hover: 'a',
				focus: 'b',
				selection: new Set(['a']),
				active: new Set(['b']),
				highlight: new Set(['a']),
				tones,
				isPlaying: true,
			}),
		)
		expect(setState).toHaveBeenCalledWith(
			'a',
			expect.objectContaining({
				isHovered: true,
				isSelected: true,
				isActive: false,
				isDimmed: false,
				isFocused: false,
				tone: 'danger',
			}),
		)
		expect(setState).toHaveBeenCalledWith(
			'b',
			expect.objectContaining({ isHovered: false, isFocused: true, isActive: true, isDimmed: true, tone: 'none' }),
		)
		expect(setHighlight).toHaveBeenCalledWith(expect.any(Set))
		expect(setTones).toHaveBeenCalledWith(tones)
	})

	it('активные модели пульсируют, только пока сценарий идёт; без подсветки никто не затемнён', () => {
		const { content, setState } = contentOf()
		applyStates(content, states({ active: new Set(['a']), isPlaying: false }))
		expect(setState).toHaveBeenCalledWith('a', expect.objectContaining({ isActive: false, isDimmed: false }))
	})
})

describe('качество сцены', () => {
	it('тени: high — картой, low — без теней, auto — картой до 80 узлов, дальше пятнами', () => {
		expect(shadowModeOf('high', 500)).toBe('map')
		expect(shadowModeOf('low', 1)).toBe('none')
		expect(shadowModeOf('auto', 80)).toBe('map')
		expect(shadowModeOf('auto', 81)).toBe('blob')
	})

	it('детали видны от 18 px клетки и не видны при low', () => {
		expect(isDetailShown('auto', 18)).toBe(true)
		expect(isDetailShown('auto', 17.9)).toBe(false)
		expect(isDetailShown('high', 40)).toBe(true)
		expect(isDetailShown('low', 400)).toBe(false)
	})

	it('размер клетки на экране зависит от камеры', () => {
		const camera = new OrthographicCamera(-10, 10, 10, -10)
		camera.position.set(0, 10, 0)
		camera.lookAt(0, 0, 0)
		camera.updateProjectionMatrix()
		const pixels = cellPixels(camera, { width: 800, height: 800 }, { at: new Vector3(), cell: 2 })
		expect(pixels).toBeCloseTo(80)
		camera.zoom = 2
		camera.updateProjectionMatrix()
		expect(cellPixels(camera, { width: 800, height: 800 }, { at: new Vector3(), cell: 2 })).toBeCloseTo(160)
	})
})

describe('тона узлов и узлы сценария', () => {
	function fake(parts: {
		live?: Record<string, { status?: string }>
		statuses?: unknown
		active?: string[]
		timeline?: unknown[]
		edges?: Array<[string, { source: string; target: string }]>
	}) {
		return {
			live: ref({ nodes: parts.live }),
			data: ref({ statuses: parts.statuses }),
			shown: ref({ nodes: [{ id: 'a', status: 'warning' }, { id: 'b' }, { id: 'c', status: 'error' }] }),
			scenario: { state: ref({ activeSteps: parts.active ?? [] }), timeline: ref(parts.timeline ?? []) },
			graph: ref({ edges: new Map(parts.edges ?? []) }),
		} as never
	}

	it('живой статус сильнее статуса в данных', () => {
		const tones = nodeTones(fake({ live: { a: { status: 'ok' } } }))
		expect(tones.get('a')).toBe('none')
		expect(tones.get('b')).toBe('none')
		expect(tones.get('c')).toBe('danger')
		expect(nodeTones(fake({})).get('a')).toBe('warning')
	})

	it('узлы сценария: пока нет активных шагов — пусто', () => {
		expect(scenarioIds(fake({})).size).toBe(0)
	})

	it('активные шаги дают свои узлы и связи с их концами', () => {
		const model = fake({
			active: ['s1', 's2', 's4'],
			timeline: [
				{ step: 's1', node: 'a' },
				{ step: 's2', edge: 'e1' },
				{ step: 's3', node: 'c' },
				{ step: 's4', edge: 'ghost' },
			],
			edges: [['e1', { source: 'a', target: 'b' }]],
		})
		expect([...scenarioIds(model)].sort()).toEqual(['a', 'b', 'e1'])
	})
})
