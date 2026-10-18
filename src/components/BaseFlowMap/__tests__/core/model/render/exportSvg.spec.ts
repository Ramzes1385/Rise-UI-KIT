import { vi } from 'vitest'
import { buildScenePng, buildSceneSvg } from '../../../../model/render/flowExportSvg'
import type { FlowExportScene } from '../../../../types/internal/core/flowRenderInternal.types'

const scene = (patch: Partial<FlowExportScene> = {}): FlowExportScene =>
	({
		nodes: [
			{ rect: { x: 0, y: 0, width: 100, height: 40 }, node: { label: 'A&B <x>' }, kind: { shape: { shape: 'cylinder' } } },
			{ rect: { x: 200, y: 0, width: 100, height: 40 }, node: { label: 'C' }, kind: { shape: { shape: 'rect' } } },
		],
		edges: [
			{ route: { path: 'M0 0L9 9' }, kind: { stroke: 'dashed' }, markerEnd: 'arrow', markerStart: 'circle' },
			{ route: { path: 'M1 1L8 8' }, kind: { stroke: 'dotted' }, markerEnd: null, markerStart: null },
			{ route: { path: 'M2 2L7 7' }, kind: { stroke: 'solid' }, markerEnd: null, markerStart: null },
		],
		groups: [
			{ rect: { x: -10, y: -10, width: 400, height: 100 }, group: { label: 'Группа "1"' }, border: 'dashed' },
			{ rect: { x: -5, y: -5, width: 50, height: 50 }, group: { label: 'Вложенная' }, border: 'solid' },
		],
		labels: [{ point: { x: 50, y: 20 }, text: 'a<b' }],
		markers: [
			{ id: 'arrow', paths: ['M0 0L10 5L0 10Z'], isFilled: true, refX: 9 },
			{ id: 'circle', paths: ['M1 5A4 4 0 1 0 9 5Z'], isFilled: false, refX: 1 },
		],
		bounds: { x: 0, y: 0, width: 300, height: 40 },
		viewport: { x: -10, y: -20, zoom: 2 },
		frame: { width: 200, height: 100 },
		uid: 'u',
		root: null,
		...patch,
	}) as unknown as FlowExportScene

describe('buildSceneSvg', () => {
	it('собирает узлы, связи, группы, подписи и маркеры; текст экранируется', () => {
		const svg = buildSceneSvg(scene())
		expect(svg).toContain('A&amp;B &lt;x&gt;')
		expect(svg).toContain('Группа &quot;1&quot;')
		expect(svg).toContain('a&lt;b')
		expect(svg).toContain('stroke-dasharray="6 4"')
		expect(svg).toContain('stroke-dasharray="2 4"')
		expect(svg).toContain('marker-end="url(#u-arrow)"')
		expect(svg).toContain('marker-start="url(#u-circle)"')
		expect(svg).toContain('<marker id="u-arrow"')
		expect(svg).toContain('fill="#c4c7cc"')
		expect(svg).toContain('viewBox="-24 -24 348 88"')
		expect(svg).toContain('fill="#f6f6f7"')
	})

	it('прозрачный фон не рисует подложку, область viewport берёт видимую часть', () => {
		const svg = buildSceneSvg(scene(), { background: 'transparent', area: 'viewport' })
		expect(svg).not.toContain('#f6f6f7')
		expect(svg).toContain('viewBox="5 10 100 50"')
	})

	it('цвета берутся из токенов корня карты', () => {
		const root = document.createElement('div')
		root.style.setProperty('--rise-bg-muted', '#101010')
		document.body.append(root)
		const svg = buildSceneSvg(scene({ root }))
		root.remove()
		expect(svg).toContain('#101010')
		expect(svg).toContain('#ffffff')
	})
})

describe('buildScenePng', () => {
	const toBlob = vi.fn()
	const drawImage = vi.fn()
	let behavior: 'load' | 'fail' = 'load'

	class FakeImage {
		onload: () => void = () => undefined
		onerror: () => void = () => undefined
		set src(_value: string) {
			queueMicrotask(() => (behavior === 'load' ? this.onload() : this.onerror()))
		}
	}

	beforeEach(() => {
		behavior = 'load'
		toBlob.mockReset()
		drawImage.mockReset()
		vi.stubGlobal('Image', FakeImage)
		URL.createObjectURL = vi.fn(() => 'blob:x')
		URL.revokeObjectURL = vi.fn()
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as never)
		vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(toBlob)
	})

	afterEach(() => {
		vi.unstubAllGlobals()
		vi.restoreAllMocks()
	})

	it('рисует svg на холсте с множителем и возвращает png', async () => {
		const png = new Blob(['x'], { type: 'image/png' })
		toBlob.mockImplementation((done: (blob: Blob | null) => void) => done(png))
		const result = await buildScenePng(scene(), { pixelRatio: 1 })
		expect(result).toBe(png)
		expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 348, 88)
		expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x')
	})

	it('без множителя берётся 2, пустой результат холста — пустой png', async () => {
		toBlob.mockImplementation((done: (blob: Blob | null) => void) => done(null))
		const result = await buildScenePng(scene())
		expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 696, 176)
		expect(result.type).toBe('image/png')
		expect(result.size).toBe(0)
	})

	it('ошибка загрузки изображения отклоняет промис и освобождает адрес', async () => {
		behavior = 'fail'
		await expect(buildScenePng(scene())).rejects.toThrow('svg')
		expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x')
	})

	it('без 2d-контекста картинка всё равно возвращается', async () => {
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
		toBlob.mockImplementation((done: (blob: Blob | null) => void) => done(new Blob([], { type: 'image/png' })))
		await expect(buildScenePng(scene())).resolves.toBeInstanceOf(Blob)
		expect(drawImage).not.toHaveBeenCalled()
	})
})
