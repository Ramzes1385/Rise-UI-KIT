import { cropBlob } from '../../model/crop/cropBlob'

const SOURCE = { image: document.createElement('img'), crop: { x: 150, y: 0, size: 500 } }

function mockCanvas(options: { hasContext?: boolean; isTainted?: boolean } = {}) {
	const context = { beginPath: vi.fn(), arc: vi.fn(), clip: vi.fn(), drawImage: vi.fn() }
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue((options.hasContext === false ? null : context) as never)
	const toBlob = vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback, type) => {
		if (options.isTainted) throw new DOMException('Tainted canvases may not be exported.', 'SecurityError')
		callback(new Blob(['image'], { type }))
	})
	return { context, toBlob }
}

describe('картинка по кадру', () => {
	afterEach(() => vi.restoreAllMocks())

	it('PNG 256 × 256 по умолчанию; у круга углы прозрачные — рисование по кругу', async () => {
		const { context } = mockCanvas()
		const blob = await cropBlob(SOURCE, 'circle')
		expect(blob?.type).toBe('image/png')
		expect(context.arc).toHaveBeenCalledWith(128, 128, 128, 0, Math.PI * 2)
		expect(context.clip).toHaveBeenCalled()
		expect(context.drawImage).toHaveBeenCalledWith(SOURCE.image, 150, 0, 500, 500, 0, 0, 256, 256)
	})

	it('квадрат и JPEG — без обрезки по кругу, со своими размером и качеством', async () => {
		const { context, toBlob } = mockCanvas()
		await cropBlob(SOURCE, 'square', { size: 128.4, type: 'image/jpeg', quality: 0.8 })
		expect(context.clip).not.toHaveBeenCalled()
		expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.8)
		mockCanvas()
		await cropBlob(SOURCE, 'circle', { type: 'image/webp' })
		expect(context.clip).not.toHaveBeenCalled()
	})

	it('без canvas и с фото с другого сайта без CORS — null', async () => {
		mockCanvas({ hasContext: false })
		expect(await cropBlob(SOURCE, 'circle')).toBeNull()
		mockCanvas({ isTainted: true })
		expect(await cropBlob(SOURCE, 'circle')).toBeNull()
	})
})
