import { signaturePng } from '../../model/signature/signaturePng'

const OPTIONS = { width: 400, height: 160, color: '#1d4ed8', lineWidth: 3 }

function mockCanvas(hasContext = true) {
	const context = { scale: vi.fn(), fillRect: vi.fn(), stroke: vi.fn(), fillStyle: '', strokeStyle: '', lineWidth: 1, lineCap: '' }
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue((hasContext ? context : null) as never)
	vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(new Blob(['png'], { type: 'image/png' })))
	vi.stubGlobal(
		'Path2D',
		class {
			d: string
			constructor(d: string) {
				this.d = d
			}
		},
	)
	return context
}

describe('подпись в PNG', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
	})

	it('рисует путь на canvas вдвое плотнее поля и возвращает Blob', async () => {
		const context = mockCanvas()
		const blob = await signaturePng([[{ x: 1, y: 2 }]], OPTIONS)
		expect(blob?.type).toBe('image/png')
		expect(context.scale).toHaveBeenCalledWith(2, 2)
		expect(context.fillRect).not.toHaveBeenCalled()
		expect(context).toMatchObject({ strokeStyle: '#1d4ed8', lineWidth: 3, lineCap: 'round' })
		expect(context.stroke).toHaveBeenCalledWith(expect.objectContaining({ d: 'M1 2h0.1' }))
	})

	it('фон и своя плотность пикселей', async () => {
		const context = mockCanvas()
		await signaturePng([[{ x: 1, y: 2 }]], { ...OPTIONS, background: '#ffffff', pixelRatio: 1 })
		expect(context.scale).toHaveBeenCalledWith(1, 1)
		expect(context.fillRect).toHaveBeenCalledWith(0, 0, 400, 160)
		expect(context.fillStyle).toBe('#ffffff')
	})

	it('без штрихов или без canvas — null', async () => {
		mockCanvas()
		expect(await signaturePng([], OPTIONS)).toBeNull()
		mockCanvas(false)
		expect(await signaturePng([[{ x: 1, y: 2 }]], OPTIONS)).toBeNull()
	})
})
