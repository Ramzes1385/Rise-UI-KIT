import { captureScene } from '../../model/view/flowMap3dCapture'

function source(width = 20, height = 10) {
	return {
		host: document.createElement('div'),
		canvas: Object.assign(document.createElement('canvas'), { width, height }),
		render: vi.fn(),
	}
}

function stubContext() {
	const context = {
		fillRect: vi.fn(),
		drawImage: vi.fn(),
		clearRect: vi.fn(),
		getImageData: () => ({ data: [10, 20, 30, 255] }),
		fillStyle: '',
	}
	vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never)
	return context
}

describe('captureScene', () => {
	it('рисует кадр, заливает фон токеном темы и отдаёт PNG', async () => {
		const context = stubContext()
		const blob = new Blob(['png'])
		const toBlob = vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(blob))
		const parts = source()
		await expect(captureScene(parts)).resolves.toBe(blob)
		expect(parts.render).toHaveBeenCalled()
		expect(context.fillRect).toHaveBeenCalledWith(0, 0, 20, 10)
		expect(context.drawImage).toHaveBeenCalledWith(parts.canvas, 0, 0, 20, 10)
		expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png')
	})

	it('учитывает плотность пикселей и прозрачный фон', async () => {
		const context = stubContext()
		vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(new Blob(['x'])))
		await captureScene(source(), { pixelRatio: 2, background: 'transparent' })
		expect(context.fillRect).not.toHaveBeenCalled()
		expect(context.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 40, 20)
	})

	it('без контекста 2D и без blob отказывает', async () => {
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
		await expect(captureScene(source())).rejects.toThrow('canvas 2d')
		stubContext()
		vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(null))
		await expect(captureScene(source())).rejects.toThrow('toBlob')
	})
})
