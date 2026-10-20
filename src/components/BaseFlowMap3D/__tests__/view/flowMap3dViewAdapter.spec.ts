import { createViewAdapter } from '../../model/view/flowMap3dViewAdapter'
import type { FlowMap3DAdapterParts } from '../../types/internal/flowMap3dView.types'

function setup(view: '2d' | '3d', hasTwoD = true) {
	const twoD = {
		fitView: vi.fn(),
		focus: vi.fn(),
		zoom: vi.fn(),
		getViewport: vi.fn(() => ({ x: 1, y: 2, zoom: 3 })),
		setViewport: vi.fn(),
		exportSvg: vi.fn(async () => '<svg/>'),
		exportPng: vi.fn(async () => new Blob(['2d'])),
	}
	const camera = {
		fly: vi.fn(),
		fit: vi.fn(),
		zoomIn: vi.fn(),
		zoomOut: vi.fn(),
		viewport: vi.fn(() => ({ x: 100, y: 60, zoom: 2 })),
		setViewport: vi.fn(),
	}
	const parts = {
		camera,
		getView: () => view,
		getTwoD: () => (hasTwoD ? twoD : null),
		getSize: () => ({ width: 800, height: 600 }),
		focusNode: vi.fn(),
		getCapture: vi.fn(() => null),
		announce: vi.fn(),
	}
	return { adapter: createViewAdapter(parts as unknown as FlowMap3DAdapterParts), twoD, camera, parts }
}

describe('createViewAdapter: 3D', () => {
	it('fitView вписывает сцену или наезжает на один узел', () => {
		const { adapter, camera } = setup('3d')
		adapter.fitView()
		expect(camera.fit).toHaveBeenCalledOnce()
		adapter.fitView({ ids: ['a', 'b'] })
		expect(camera.fit).toHaveBeenCalledTimes(2)
		adapter.fitView({ ids: ['a'] })
		expect(camera.fly).toHaveBeenCalledWith('a')
	})

	it('focus ставит фокус, а наезд — только по просьбе', () => {
		const { adapter, camera, parts } = setup('3d')
		adapter.focus('a')
		expect(parts.focusNode).toHaveBeenCalledWith('a')
		expect(camera.fly).not.toHaveBeenCalled()
		adapter.focus('a', { isZoomed: true })
		expect(camera.fly).toHaveBeenCalledWith('a')
	})

	it('zoom: in, out и число — масштаб относительно центра кадра', () => {
		const { adapter, camera } = setup('3d')
		adapter.zoom('in')
		adapter.zoom('out')
		expect(camera.zoomIn).toHaveBeenCalledOnce()
		expect(camera.zoomOut).toHaveBeenCalledOnce()
		adapter.zoom(4)
		expect(camera.setViewport).toHaveBeenCalledWith(
			{ zoom: 4, x: 400 - (400 - 100) * 2, y: 300 - (300 - 60) * 2 },
			{ isAnimated: true },
		)
	})

	it('область читается и пишется через камеру', () => {
		const { adapter, camera } = setup('3d')
		expect(adapter.getViewport()).toEqual({ x: 100, y: 60, zoom: 2 })
		adapter.setViewport({ x: 1, y: 1, zoom: 1 }, { isAnimated: true })
		expect(camera.setViewport).toHaveBeenCalledWith({ x: 1, y: 1, zoom: 1 }, { isAnimated: true })
	})

	it('exportSvg в 3D идёт через подключённый 2D или отказывает', async () => {
		const { adapter, twoD } = setup('3d')
		await expect(adapter.exportSvg()).resolves.toBe('<svg/>')
		expect(twoD.exportSvg).toHaveBeenCalled()
		const none = setup('3d', false)
		await expect(none.adapter.exportSvg()).rejects.toThrow('BaseFlowMap3D: SVG строится в 2D-виде')
	})

	it('exportPng снимает сцену и объявляет готовность, без сцены отказывает', async () => {
		const { adapter, parts } = setup('3d')
		await expect(adapter.exportPng()).rejects.toThrow('сцена ещё не собрана')
		const blob = new Blob(['x'])
		const render = vi.fn()
		parts.getCapture.mockReturnValue({
			host: document.createElement('div'),
			canvas: Object.assign(document.createElement('canvas'), { width: 10, height: 10 }),
			render,
		} as never)
		vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
			fillRect: vi.fn(),
			drawImage: vi.fn(),
			getImageData: () => ({ data: [1, 2, 3, 255] }),
			clearRect: vi.fn(),
		} as never)
		vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(blob))
		await expect(adapter.exportPng()).resolves.toBe(blob)
		expect(render).toHaveBeenCalled()
		expect(parts.announce).toHaveBeenCalledWith('Снимок сцены готов')
	})
})

describe('createViewAdapter: 2D', () => {
	it('все команды уходят 2D-контроллеру', async () => {
		const { adapter, twoD, camera } = setup('2d')
		adapter.fitView({ ids: ['a'] })
		adapter.focus('a', { isZoomed: true })
		adapter.zoom('in')
		adapter.setViewport({ x: 0, y: 0, zoom: 1 })
		expect(adapter.getViewport()).toEqual({ x: 1, y: 2, zoom: 3 })
		await adapter.exportPng()
		await adapter.exportSvg()
		expect(twoD.fitView).toHaveBeenCalled()
		expect(twoD.focus).toHaveBeenCalledWith('a', { isZoomed: true })
		expect(twoD.zoom).toHaveBeenCalledWith('in')
		expect(twoD.setViewport).toHaveBeenCalled()
		expect(twoD.exportPng).toHaveBeenCalled()
		expect(twoD.exportSvg).toHaveBeenCalled()
		expect(camera.fit).not.toHaveBeenCalled()
	})

	it('если 2D ещё не подключён, команды достаются камере', () => {
		const { adapter, camera } = setup('2d', false)
		expect(adapter.getViewport()).toEqual({ x: 100, y: 60, zoom: 2 })
		adapter.fitView()
		expect(camera.fit).toHaveBeenCalled()
	})
})
