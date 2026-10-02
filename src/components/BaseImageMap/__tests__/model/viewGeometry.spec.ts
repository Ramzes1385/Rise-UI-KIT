import { clampScale, clampView, fitArea, fitStage, scaleForArea, zoomAround } from '../../model/zoom/viewGeometry'

const FRAME = { viewportWidth: 400, viewportHeight: 200, stageWidth: 400, stageHeight: 200 }

describe('viewGeometry', () => {
	it('fitStage вписывает слой в окно с сохранением пропорций', () => {
		expect(fitStage({ width: 400, height: 400 }, { width: 800, height: 400 })).toEqual({ width: 400, height: 200 })
		expect(fitStage({ width: 400, height: 100 }, { width: 800, height: 400 })).toEqual({ width: 200, height: 100 })
	})

	it('fitStage без размеров возвращает размер окна', () => {
		expect(fitStage({ width: 0, height: 100 }, { width: 800, height: 400 })).toEqual({ width: 0, height: 100 })
		expect(fitStage({ width: 300, height: 100 }, { width: 0, height: 0 })).toEqual({ width: 300, height: 100 })
	})

	it('clampView центрирует сцену меньше окна', () => {
		const frame = { ...FRAME, stageWidth: 200 }
		expect(clampView({ scale: 1, x: 50, y: 30 }, frame)).toEqual({ scale: 1, x: 100, y: 0 })
	})

	it('clampView не даёт увести увеличенную сцену за края', () => {
		expect(clampView({ scale: 2, x: 10, y: -500 }, FRAME)).toEqual({ scale: 2, x: 0, y: -200 })
		expect(clampView({ scale: 2, x: -100, y: -50 }, FRAME)).toEqual({ scale: 2, x: -100, y: -50 })
	})

	it('zoomAround сохраняет точку под указателем', () => {
		expect(zoomAround({ scale: 1, x: 0, y: 0 }, { x: 100, y: 50 }, 2)).toEqual({ scale: 2, x: -100, y: -50 })
	})

	it('clampScale держит масштаб в пределах 1…max', () => {
		expect(clampScale(0.5, 4)).toBe(1)
		expect(clampScale(6, 4)).toBe(4)
		expect(clampScale(2, 4)).toBe(2)
		expect(clampScale(3, 0.5)).toBe(1)
	})

	it('fitArea ставит центр области в центр окна', () => {
		expect(fitArea({ x: 0.5, y: 0.5, width: 0, height: 0 }, FRAME, 2)).toEqual({ scale: 2, x: -200, y: -100 })
	})

	it('scaleForArea берёт меньший из масштабов по осям, у нулевой оси — бесконечность', () => {
		expect(scaleForArea({ x: 0, y: 0, width: 0.5, height: 0.25 }, FRAME, 1)).toBe(2)
		expect(scaleForArea({ x: 0, y: 0, width: 0, height: 0.5 }, FRAME, 1)).toBe(2)
		expect(scaleForArea({ x: 0, y: 0, width: 0.25, height: 0 }, FRAME, 1)).toBe(4)
		expect(scaleForArea({ x: 0, y: 0, width: 0, height: 0 }, FRAME, 1)).toBe(Infinity)
	})
})
