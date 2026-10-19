import { mountReview, stubFrame } from '../../fixtures/reviewUi'
import { createReviewHarness } from '../../fixtures/reviewHarness'
import { exportFlowPng, exportFlowSvg } from '../../../../model/controller/flowExport'

function parse(svg: string): Document {
	return new DOMParser().parseFromString(svg, 'image/svg+xml')
}

describe('экспорт без вида', () => {
	it('пустой SVG корректен: разбирается как XML, корень svg в нужном пространстве имён', async () => {
		const document = parse(await exportFlowSvg())
		expect(document.querySelector('parsererror')).toBeNull()
		expect(document.documentElement.localName).toBe('svg')
		expect(document.documentElement.namespaceURI).toBe('http://www.w3.org/2000/svg')
		expect(document.documentElement.getAttribute('viewBox')).toBe('0 0 1 1')
		expect(document.documentElement.childElementCount).toBe(0)
	})

	it('опции не меняют пустой результат, PNG — пустой Blob нужного типа', async () => {
		expect(await exportFlowSvg({ background: 'transparent' })).toBe(await exportFlowSvg())
		const png = await exportFlowPng({ pixelRatio: 3 })
		expect(png).toBeInstanceOf(Blob)
		expect(png.type).toBe('image/png')
		expect(png.size).toBe(0)
	})

	it('публичный вызов контроллера до готовности вида отдаёт то же', async () => {
		const { model } = createReviewHarness()
		const document = parse(await model.controller.exportSvg())
		expect(document.querySelector('parsererror')).toBeNull()
		expect((await model.controller.exportPng()).type).toBe('image/png')
	})
})

describe('экспорт готовой карты через публичный вызов', () => {
	beforeEach(() => stubFrame(1200))

	it('SVG содержит подписи узлов и разбирается как XML', async () => {
		const { controller } = mountReview()
		const document = parse(await controller.exportSvg())
		expect(document.querySelector('parsererror')).toBeNull()
		const text = document.documentElement.textContent
		expect(text).toContain('Alpha')
		expect(text).toContain('Beta')
		expect(text).toContain('заказ')
	})

	it('PNG собирается из SVG на холсте', async () => {
		class FakeImage {
			onload: (() => void) | null = null
			onerror: (() => void) | null = null
			set src(_value: string) {
				queueMicrotask(() => this.onload?.())
			}
		}
		const png = new Blob(['x'], { type: 'image/png' })
		vi.stubGlobal('Image', FakeImage)
		URL.createObjectURL = vi.fn(() => 'blob:x')
		URL.revokeObjectURL = vi.fn()
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: vi.fn() } as never)
		vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(done => done(png))
		const { controller } = mountReview()
		expect(await controller.exportPng({ pixelRatio: 1 })).toBe(png)
		vi.unstubAllGlobals()
	})
})
