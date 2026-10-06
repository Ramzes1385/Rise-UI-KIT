import {
	clampScale,
	clampView,
	fitArea,
	fitStage,
	pageRatio,
	retargetView,
	revealOffset,
	scaleForArea,
	toViewportPoint,
	zoomAround,
} from '../../model/zoom/viewGeometry'

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

	it('revealOffset сдвигает минимально, чтобы объект с отступом попал в окно; больший окна — к началу', () => {
		const viewport = { left: 0, top: 0, right: 400, bottom: 200 }
		expect(revealOffset({ left: 100, top: 50, right: 120, bottom: 70 }, viewport, 10)).toEqual({ x: 0, y: 0 })
		expect(revealOffset({ left: -50, top: -30, right: -30, bottom: -10 }, viewport, 10)).toEqual({ x: 60, y: 40 })
		expect(revealOffset({ left: 420, top: 250, right: 440, bottom: 270 }, viewport, 10)).toEqual({ x: -50, y: -80 })
		expect(revealOffset({ left: 300, top: 0, right: 900, bottom: 20 }, viewport, 10)).toEqual({ x: -290, y: 10 })
	})

	it('retargetView держит в центре окна ту же точку карты при смене размера окна', () => {
		const view = { scale: 2, x: -100, y: -50 }
		const larger = { viewportWidth: 800, viewportHeight: 400, stageWidth: 800, stageHeight: 400 }
		expect(retargetView(view, FRAME, larger)).toEqual({ scale: 2, x: -200, y: -100 })
		expect(retargetView(retargetView(view, FRAME, larger), larger, FRAME)).toEqual(view)
	})

	it('retargetView учитывает поля вокруг сцены, когда окно другой пропорции', () => {
		const square = { viewportWidth: 400, viewportHeight: 400, stageWidth: 400, stageHeight: 200 }
		expect(retargetView({ scale: 2, x: -100, y: -50 }, FRAME, square)).toEqual({ scale: 2, x: -100, y: 50 })
	})

	it('retargetView не меняет вид, если у сцены нет размера', () => {
		const view = { scale: 2, x: -100, y: -50 }
		expect(retargetView(view, { ...FRAME, stageWidth: 0 }, FRAME)).toBe(view)
		expect(retargetView(view, FRAME, { ...FRAME, stageHeight: 0 })).toBe(view)
		expect(retargetView(view, { ...FRAME, stageHeight: 0 }, FRAME)).toBe(view)
		expect(retargetView(view, FRAME, { ...FRAME, stageWidth: 0 })).toBe(view)
	})

	it('pageRatio — отношение внутреннего размера к размеру на странице, 1 при нулевом размере', () => {
		expect(pageRatio({ left: 0, top: 0, width: 200, height: 100 }, { width: 400, height: 400 })).toEqual({ x: 2, y: 4 })
		expect(pageRatio({ left: 0, top: 0, width: 0, height: 100 }, { width: 400, height: 50 })).toEqual({ x: 1, y: 0.5 })
		expect(pageRatio({ left: 0, top: 0, width: 200, height: 100 }, { width: 0, height: 0 })).toEqual({ x: 1, y: 1 })
	})

	it('pageRatio не принимает округление clientWidth и clientHeight за CSS-масштаб: расхождение до 1 px — это 1', () => {
		expect(pageRatio({ left: 0, top: 0, width: 1050, height: 656.25 }, { width: 1050, height: 656 })).toEqual({ x: 1, y: 1 })
		expect(pageRatio({ left: 0, top: 0, width: 1049.4, height: 656.9 }, { width: 1050, height: 656 })).toEqual({ x: 1, y: 1 })
		expect(pageRatio({ left: 0, top: 0, width: 1048.9, height: 654 }, { width: 1050, height: 656 }).x).toBeCloseTo(1.00105, 4)
	})

	it('toViewportPoint при дробной высоте окна не сдвигает точку', () => {
		const box = { left: 25, top: 65, width: 1050, height: 656.25 }
		expect(toViewportPoint({ x: 325, y: 465 }, box, { width: 1050, height: 656 })).toEqual({ x: 300, y: 400 })
	})

	it('toViewportPoint переводит точку страницы во внутренние пиксели окна, в том числе при CSS-масштабе', () => {
		expect(toViewportPoint({ x: 150, y: 90 }, { left: 100, top: 40, width: 400, height: 200 }, { width: 400, height: 200 })).toEqual({
			x: 50,
			y: 50,
		})
		expect(toViewportPoint({ x: 150, y: 90 }, { left: 100, top: 40, width: 200, height: 100 }, { width: 400, height: 200 })).toEqual({
			x: 100,
			y: 100,
		})
	})
})
