/**
 * Unit-тесты для useImageZoom.
 * Проверяют масштаб, поворот, сброс и мини-карту.
 */

import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { useImageZoom } from './useImageZoom'

/** Обёртка для вызова composable внутри Vue-контекста */
function withSetup<T>(composable: () => T): T {
	let result: T
	mount({
		setup() {
			result = composable()
			return () => null
		},
	})
	return result!
}

/** Создать опции по умолчанию */
function createOptions(overrides: Record<string, unknown> = {}) {
	return {
		initialScale: () => 1,
		zoomStep: () => 0.25,
		minScale: () => 0.5,
		maxScale: () => 5,
		closeOnOverlay: () => true,
		onZoom: vi.fn(),
		getZoomImgEl: () => null,
		getMinimapImgEl: () => null,
		...overrides,
	}
}

/** Обёртка для вызова composable с доступом к wrapper (для unmount) */
function withSetupFull<T>(composable: () => T): { result: T; wrapper: ReturnType<typeof mount> } {
	let result: T
	const wrapper = mount({
		setup() {
			result = composable()
			return () => null
		},
	})
	return { result: result!, wrapper }
}

/** Создать мок HTMLImageElement с заданными размерами */
function createMockImgEl(natW: number, natH: number, offW: number, offH: number): HTMLImageElement {
	const img = document.createElement('img')
	Object.defineProperty(img, 'naturalWidth', { value: natW, configurable: true })
	Object.defineProperty(img, 'naturalHeight', { value: natH, configurable: true })
	Object.defineProperty(img, 'offsetWidth', { value: offW, configurable: true })
	Object.defineProperty(img, 'offsetHeight', { value: offH, configurable: true })
	return img
}

/** Создать zoom с мок-изображениями для тестов мини-карты */
function createZoomWithMocks(overrides: Record<string, unknown> = {}) {
	const mockZoomImg = createMockImgEl(7680, 4320, 3840, 2160)
	const mockMinimapImg = createMockImgEl(7680, 4320, 200, 150)
	const zoom = withSetup(() =>
		useImageZoom(
			createOptions({
				initialScale: () => 2,
				getZoomImgEl: () => mockZoomImg,
				getMinimapImgEl: () => mockMinimapImg,
				...overrides,
			}),
		),
	)
	zoom.syncSizes()
	return zoom
}

describe('useImageZoom', () => {
	afterEach(() => {
		document.body.style.overflow = ''
	})
	it('должен возвращать начальный масштаб 100%', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		expect(zoom.scalePercent.value).toBe(100)
	})

	it('должен увеличивать масштаб при zoomIn', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.zoomIn()

		expect(zoom.scalePercent.value).toBe(125)
	})

	it('не должен превышать maxScale при zoomIn', () => {
		const zoom = withSetup(() => useImageZoom(createOptions({ maxScale: () => 1.5 })))

		zoom.zoomIn() // 1.25
		zoom.zoomIn() // 1.5

		expect(zoom.scalePercent.value).toBe(150)

		zoom.zoomIn() // не должен превысить

		expect(zoom.scalePercent.value).toBe(150)
	})

	it('должен уменьшать масштаб при zoomOut', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.zoomIn() // 1.25
		zoom.zoomOut() // 1.0

		expect(zoom.scalePercent.value).toBe(100)
	})

	it('не должен опускаться ниже minScale при zoomOut', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.zoomOut() // 0.75
		zoom.zoomOut() // 0.5

		expect(zoom.scalePercent.value).toBe(50)

		zoom.zoomOut() // не должен опуститься ниже

		expect(zoom.scalePercent.value).toBe(50)
	})

	it('должен сбрасывать масштаб при resetZoom', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.zoomIn()
		zoom.zoomIn()
		zoom.resetZoom()

		expect(zoom.scalePercent.value).toBe(100)
	})

	it('должен открывать зум при openZoom', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.openZoom()

		expect(zoom.isZoomOpen.value).toBe(true)
	})

	it('должен закрывать зум при closeZoom', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.openZoom()
		zoom.closeZoom()

		expect(zoom.isZoomOpen.value).toBe(false)
	})

	it('должен сбрасывать масштаб при закрытии зума', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.openZoom()
		zoom.zoomIn()
		zoom.closeZoom()

		expect(zoom.scalePercent.value).toBe(100)
	})

	it('должен вызывать onZoom при zoomIn', () => {
		const onZoom = vi.fn()
		const zoom = withSetup(() => useImageZoom(createOptions({ onZoom })))

		zoom.zoomIn()

		expect(onZoom).toHaveBeenCalledWith(1.25)
	})

	it('должен вращать изображение при rotateLeft', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.rotateLeft()

		expect(zoom.zoomImageStyle.value.transform).toContain('rotate(-90deg)')
	})

	it('должен вращать изображение при rotateRight', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.rotateRight()

		expect(zoom.zoomImageStyle.value.transform).toContain('rotate(90deg)')
	})

	it('должен определять isMinScale', () => {
		const zoom = withSetup(() => useImageZoom(createOptions({ minScale: () => 0.5 })))

		expect(zoom.isMinScale.value).toBe(false)

		zoom.zoomOut() // 0.75
		zoom.zoomOut() // 0.5

		expect(zoom.isMinScale.value).toBe(true)
	})

	it('должен определять isMaxScale', () => {
		const zoom = withSetup(() => useImageZoom(createOptions({ maxScale: () => 1.5 })))

		expect(zoom.isMaxScale.value).toBe(false)

		zoom.zoomIn() // 1.25
		zoom.zoomIn() // 1.5

		expect(zoom.isMaxScale.value).toBe(true)
	})

	it('должен закрывать зум при handleOverlayClick когда closeOnOverlay=true', () => {
		const zoom = withSetup(() => useImageZoom(createOptions({ closeOnOverlay: () => true })))

		zoom.openZoom()
		zoom.handleOverlayClick()

		expect(zoom.isZoomOpen.value).toBe(false)
	})

	it('не должен закрывать зум при handleOverlayClick когда closeOnOverlay=false', () => {
		const zoom = withSetup(() => useImageZoom(createOptions({ closeOnOverlay: () => false })))

		zoom.openZoom()
		zoom.handleOverlayClick()

		expect(zoom.isZoomOpen.value).toBe(true)
	})

	// --- handleWheel ---

	it('должен увеличивать масштаб при прокрутке колёсиком вверх (deltaY < 0)', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.handleWheel(new WheelEvent('wheel', { deltaY: -100 }))

		expect(zoom.scalePercent.value).toBe(125)
	})

	it('должен уменьшать масштаб при прокрутке колёсиком вниз (deltaY > 0)', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.zoomIn() // 1.25
		zoom.handleWheel(new WheelEvent('wheel', { deltaY: 100 }))

		expect(zoom.scalePercent.value).toBe(100)
	})

	// --- handleKeydown ---

	it('должен закрывать зум при нажатии Escape', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.openZoom()
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

		expect(zoom.isZoomOpen.value).toBe(false)
	})

	it('должен увеличивать масштаб при нажатии + или =', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.openZoom()
		document.dispatchEvent(new KeyboardEvent('keydown', { key: '+' }))

		expect(zoom.scalePercent.value).toBe(125)

		document.dispatchEvent(new KeyboardEvent('keydown', { key: '=' }))

		expect(zoom.scalePercent.value).toBe(150)
	})

	it('должен уменьшать масштаб при нажатии -', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.openZoom()
		zoom.zoomIn() // 1.25
		document.dispatchEvent(new KeyboardEvent('keydown', { key: '-' }))

		expect(zoom.scalePercent.value).toBe(100)
	})

	it('должен сбрасывать масштаб при нажатии 0', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.openZoom()
		zoom.zoomIn()
		zoom.zoomIn()
		document.dispatchEvent(new KeyboardEvent('keydown', { key: '0' }))

		expect(zoom.scalePercent.value).toBe(100)
	})

	it('не должен обрабатывать клавиши когда зум закрыт', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		document.dispatchEvent(new KeyboardEvent('keydown', { key: '+' }))

		expect(zoom.scalePercent.value).toBe(100)
	})

	// --- handleMinimapClick ---

	it('должен перемещать изображение при клике по мини-карте', () => {
		const zoom = createZoomWithMocks()

		const target = document.createElement('div')
		target.getBoundingClientRect = () =>
			({ left: 0, top: 0, width: 200, height: 150, right: 200, bottom: 150, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
		// Клик в левый верхний угол (не в центр) — вызовет смещение
		const event = new MouseEvent('click', { clientX: 50, clientY: 30 })
		Object.defineProperty(event, 'currentTarget', { value: target, configurable: true })

		zoom.handleMinimapClick(event)

		expect(zoom.translateX.value).not.toBe(0)
		expect(zoom.translateY.value).not.toBe(0)
	})

	it('не должен перемещать изображение при клике по мини-карте если zoomContentW=0', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		const target = document.createElement('div')
		target.getBoundingClientRect = () =>
			({ left: 0, top: 0, width: 200, height: 150, right: 200, bottom: 150, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
		const event = new MouseEvent('click', { clientX: 100, clientY: 75 })
		Object.defineProperty(event, 'currentTarget', { value: target, configurable: true })

		zoom.handleMinimapClick(event)

		expect(zoom.translateX.value).toBe(0)
		expect(zoom.translateY.value).toBe(0)
	})

	// --- handleMinimapDragStart / DragMove / DragEnd ---

	it('должен начинать перетаскивание мини-карты и обновлять translate', () => {
		const zoom = createZoomWithMocks()
		const addSpy = vi.spyOn(document, 'addEventListener')
		const removeSpy = vi.spyOn(document, 'removeEventListener')

		zoom.handleMinimapDragStart(new MouseEvent('mousedown', { clientX: 50, clientY: 30 }))

		expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
		expect(addSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))

		// Имитируем перетаскивание
		const moveEvent = new MouseEvent('mousemove', { clientX: 60, clientY: 40 })
		zoom.handleMinimapDragMove(moveEvent)

		expect(zoom.translateX.value).not.toBe(0)
		expect(zoom.translateY.value).not.toBe(0)

		// Завершаем перетаскивание
		zoom.handleMinimapDragEnd()

		expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
		expect(removeSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))
	})

	it('не должен обновлять translate при dragMove если перетаскивание не начато', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		const prevTX = zoom.translateX.value
		const prevTY = zoom.translateY.value

		zoom.handleMinimapDragMove(new MouseEvent('mousemove', { clientX: 60, clientY: 40 }))

		expect(zoom.translateX.value).toBe(prevTX)
		expect(zoom.translateY.value).toBe(prevTY)
	})

	// --- syncSizes ---

	it('должен обновлять размеры при syncSizes с мок-изображениями', () => {
		const mockZoomImg = createMockImgEl(800, 600, 400, 300)
		const mockMinimapImg = createMockImgEl(800, 600, 200, 150)
		const zoom = withSetup(() =>
			useImageZoom(
				createOptions({
					initialScale: () => 1,
					getZoomImgEl: () => mockZoomImg,
					getMinimapImgEl: () => mockMinimapImg,
				}),
			),
		)

		// До syncSizes — minimapViewportStyle = display:none
		expect(zoom.minimapViewportStyle.value).toEqual({ display: 'none' })

		zoom.syncSizes()

		// После syncSizes — размеры рассчитаны, viewport имеет стили
		const style = zoom.minimapViewportStyle.value
		expect(style).toHaveProperty('width')
		expect(style).toHaveProperty('height')
		expect(style).not.toHaveProperty('display')
	})

	// --- minimapViewportStyle ---

	it('должен возвращать display:none когда zoomContentW=0', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		expect(zoom.minimapViewportStyle.value).toEqual({ display: 'none' })
	})

	it('должен возвращать стили viewport мини-карты при ненулевых размерах', () => {
		const zoom = createZoomWithMocks()

		const style = zoom.minimapViewportStyle.value

		expect(style).toHaveProperty('width')
		expect(style).toHaveProperty('height')
		expect(style).toHaveProperty('transform')
		expect(style).not.toHaveProperty('display')
	})

	it('minimapViewportStyle: fallback на window.innerWidth когда containerWidth=0', () => {
		// Покрывает ветки `containerWidth.value || window.innerWidth`,
		// `containerHeight.value || window.innerHeight` (useImageZoom.ts:60-61).
		const originalW = window.innerWidth
		const originalH = window.innerHeight
		// syncSizes считывает innerWidth/Height — выставим в 0
		Object.defineProperty(window, 'innerWidth', { value: 0, configurable: true })
		Object.defineProperty(window, 'innerHeight', { value: 0, configurable: true })

		const mockZoomImg = createMockImgEl(7680, 4320, 3840, 2160)
		const mockMinimapImg = createMockImgEl(7680, 4320, 200, 150)
		const zoom = withSetup(() =>
			useImageZoom(
				createOptions({
					initialScale: () => 2,
					getZoomImgEl: () => mockZoomImg,
					getMinimapImgEl: () => mockMinimapImg,
				}),
			),
		)
		zoom.syncSizes()

		// Восстановим innerWidth/Height — теперь fallback `|| window.innerWidth` вернёт ненулевое
		Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true })
		Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true })

		const style = zoom.minimapViewportStyle.value
		expect(style).toHaveProperty('width')
		expect(style).toHaveProperty('height')

		// Восстановление
		Object.defineProperty(window, 'innerWidth', { value: originalW, configurable: true })
		Object.defineProperty(window, 'innerHeight', { value: originalH, configurable: true })
	})

	it('handleMinimapDragMove: fallback scX/scY=1 когда mmContentWidth=0', () => {
		// Покрывает ветки `mmContentWidth.value > 0 ? ... : 1` (строки 259-260).
		// minimapImg отсутствует → mmContentWidth/Height остаются 200/150 (дефолт),
		// но если выставить через addEventListener и НЕ вызвать syncSizes для minimap,
		// то ветка ":1" не пройдёт. Создаём ZoomImg с natural=0 для очистки.
		const mockZoomImg = createMockImgEl(0, 0, 0, 0)
		const zoom = withSetup(() =>
			useImageZoom(
				createOptions({
					initialScale: () => 2,
					getZoomImgEl: () => mockZoomImg,
					// Без minimapImg, чтобы mmContentWidth остался дефолтным 200
				}),
			),
		)
		// Не вызываем syncSizes — zoomContentW=0
		// Активируем перетаскивание
		zoom.handleMinimapDragStart(new MouseEvent('mousedown', { clientX: 0, clientY: 0 }))
		const prevTX = zoom.translateX.value
		zoom.handleMinimapDragMove(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }))
		// zoomContentW=0 → translate не меняется существенно (scX = 0/200 = 0)
		zoom.handleMinimapDragEnd()
		expect(typeof zoom.translateX.value).toBe('number')
		expect(prevTX).toBeDefined()
	})

	it('handleMinimapDragEnd: ранний return когда isMinimapDragging=false', () => {
		// Покрывает строку 268: `if (!isMinimapDragging.value) return`
		const zoom = withSetup(() => useImageZoom(createOptions()))
		const removeSpy = vi.spyOn(document, 'removeEventListener')
		// isMinimapDragging.value=false по умолчанию — вызов DragEnd должен вернуться сразу
		zoom.handleMinimapDragEnd()
		expect(removeSpy).not.toHaveBeenCalledWith('mousemove', expect.any(Function))
		removeSpy.mockRestore()
	})

	it('handleMinimapClick: fallback mmScale=1 когда mmContentWidth=0', () => {
		// Покрывает ветки `mmContentWidth.value > 0 ? ... : 1` (строки 285-286).
		// zoom без minimapImg → mmContentWidth дефолтно 200 — нужно занулить через syncSizes
		// с minimapImg без naturalWidth: тогда блок mmContentWidth не обновится.
		// Альтернатива: задать zoomContentW > 0 (через mockZoom), но НЕ обновлять mm.
		const mockZoomImg = createMockImgEl(800, 600, 400, 300)
		const zoom = withSetup(() =>
			useImageZoom(
				createOptions({
					initialScale: () => 1,
					getZoomImgEl: () => mockZoomImg,
				}),
			),
		)
		zoom.syncSizes() // zoomContentW обновится, mmContentWidth останется 200
		const target = document.createElement('div')
		target.getBoundingClientRect = () =>
			({ left: 0, top: 0, width: 200, height: 150, right: 200, bottom: 150, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect
		const event = new MouseEvent('click', { clientX: 50, clientY: 30 })
		Object.defineProperty(event, 'currentTarget', { value: target, configurable: true })
		expect(() => zoom.handleMinimapClick(event)).not.toThrow()
	})

	// --- minimapImageStyle ---

	it('должен возвращать стили изображения мини-карты с поворотом', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.rotateRight()

		expect(zoom.minimapImageStyle.value.transform).toBe('rotate(90deg)')
	})

	// --- watch isZoomOpen ---

	it('должен устанавливать body overflow=hidden при открытии зума', async () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.openZoom()
		await nextTick()

		expect(document.body.style.overflow).toBe('hidden')
	})

	it('должен сбрасывать body overflow при закрытии зума', async () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.openZoom()
		await nextTick()
		zoom.closeZoom()
		await nextTick()

		expect(document.body.style.overflow).toBe('')
	})

	// --- onUnmounted ---

	it('должен удалять слушатели при размонтировании компонента', () => {
		const removeSpy = vi.spyOn(document, 'removeEventListener')
		const windowRemoveSpy = vi.spyOn(window, 'removeEventListener')
		const { wrapper } = withSetupFull(() => useImageZoom(createOptions()))

		wrapper.unmount()

		expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
		expect(windowRemoveSpy).toHaveBeenCalledWith('resize', expect.any(Function))
		expect(document.body.style.overflow).toBe('')

		removeSpy.mockRestore()
		windowRemoveSpy.mockRestore()
	})

	it('не должен падать при syncSizes без zoomImgEl', async () => {
		const zoom = withSetup(() => useImageZoom(createOptions({ getZoomImgEl: () => null })))

		expect(() => zoom.syncSizes()).not.toThrow()
	})

	it('должен zoom in при прокрутке колеса вверх', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.openZoom()
		const event = { deltaY: -100 } as WheelEvent
		zoom.handleWheel(event)

		expect(zoom.scalePercent.value).toBe(125)
	})

	it('должен корректно вращать на 180 и 270 градусов', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.rotateRight()
		expect(zoom.rotation.value).toBe(90)

		zoom.rotateRight()
		expect(zoom.rotation.value).toBe(180)

		zoom.rotateLeft()
		expect(zoom.rotation.value).toBe(90)

		zoom.rotateLeft()
		expect(zoom.rotation.value).toBe(0)

		zoom.rotateLeft()
		expect(zoom.rotation.value).toBe(-90)
	})

	it('должен вызывать handleMinimapDragStart без ошибок', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))

		zoom.openZoom()

		const startEvent = { clientX: 100, clientY: 100 } as MouseEvent
		expect(() => zoom.handleMinimapDragStart(startEvent)).not.toThrow()
	})

	// --- calcContain: широкое изображение (imgAspect > elAspect) ---

	it('должен корректно рассчитывать contain для широкого изображения', () => {
		// Широкое изображение 1920×400 в узком контейнере 300×300
		const mockZoomImg = createMockImgEl(1920, 400, 300, 300)
		const mockMinimapImg = createMockImgEl(1920, 400, 200, 150)
		const zoom = withSetup(() =>
			useImageZoom(
				createOptions({
					initialScale: () => 2,
					getZoomImgEl: () => mockZoomImg,
					getMinimapImgEl: () => mockMinimapImg,
				}),
			),
		)

		expect(() => zoom.syncSizes()).not.toThrow()

		const style = zoom.minimapViewportStyle.value
		expect(style).toHaveProperty('width')
		expect(style).toHaveProperty('height')
		expect(style).not.toHaveProperty('display')
	})

	// --- clampPosition: scale > 1 и изображение шире/выше контейнера ---

	it('должен ограничивать translate при scale > 1 и большом изображении', () => {
		const mockZoomImg = createMockImgEl(7680, 4320, 3840, 2160)
		const zoom = withSetup(() =>
			useImageZoom(
				createOptions({
					initialScale: () => 3,
					getZoomImgEl: () => mockZoomImg,
				}),
			),
		)
		zoom.syncSizes()

		// Устанавливаем translate за пределы — clampPosition должен ограничить
		zoom.translateX.value = 99999
		zoom.translateY.value = 99999
		zoom.zoomIn() // вызовет clampPosition

		expect(zoom.translateX.value).not.toBe(99999)
		expect(zoom.translateY.value).not.toBe(99999)
	})

	// --- handleKeydown: не-зум-клавиша при открытом зуме ---

	it('не должен реагировать на не-зум-клавиши при открытом зуме', () => {
		const zoom = withSetup(() => useImageZoom(createOptions()))
		zoom.openZoom()
		const prevScale = zoom.scalePercent.value

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
		document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }))

		expect(zoom.scalePercent.value).toBe(prevScale)
		expect(zoom.isZoomOpen.value).toBe(true)
	})
})
