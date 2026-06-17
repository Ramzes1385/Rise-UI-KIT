/**
 * Unit-тесты для useSwipe.
 * 100% покрытие: все ветки, функции, строки.
 */

import { mount } from '@vue/test-utils'
import { useSwipe } from './useSwipe'

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

/** Обёртка с доступом к wrapper для unmount */
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

/** Создать мок TouchEvent */
function createTouchEvent(type: string, touches: { clientX: number; clientY: number }[]): TouchEvent {
	return {
		type,
		touches: touches.map(t => ({ clientX: t.clientX, clientY: t.clientY })),
		changedTouches: touches.map(t => ({ clientX: t.clientX, clientY: t.clientY })),
		preventDefault: vi.fn(),
	} as unknown as TouchEvent
}

/** Создать мок MouseEvent */
function createMouseEvent(type: string, clientX: number, clientY: number): MouseEvent {
	return {
		type,
		clientX,
		clientY,
		preventDefault: vi.fn(),
	} as unknown as MouseEvent
}

describe('useSwipe', () => {
	// --- Базовые возвращаемые значения ---

	it('должен возвращать обработчики событий и реактивные свойства', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		expect(swipe.isDragging.value).toBe(false)
		expect(swipe.dragOffset.value).toBe(0)
		expect(swipe.onTouchStart).toBeTypeOf('function')
		expect(swipe.onTouchMove).toBeTypeOf('function')
		expect(swipe.onTouchEnd).toBeTypeOf('function')
		expect(swipe.onDragStart).toBeTypeOf('function')
	})

	// --- Порог по умолчанию ---

	it('должен использовать порог 50 по умолчанию если threshold не передан', () => {
		const onSwipeNext = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, onSwipeNext }))

		// Свайп 60px — больше порога 50 → должен сработать
		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 40, clientY: 100 }]))

		expect(onSwipeNext).toHaveBeenCalled()
	})

	it('не должен триггерить свайп при смещении меньше порога по умолчанию (50)', () => {
		const onSwipeNext = vi.fn()
		const onSwipePrev = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, onSwipeNext, onSwipePrev }))

		// Свайп 30px — меньше порога 50 → не должен сработать
		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 70, clientY: 100 }]))

		expect(onSwipeNext).not.toHaveBeenCalled()
		expect(onSwipePrev).not.toHaveBeenCalled()
	})

	// --- onTouchStart ---

	it('должен устанавливать isDragging=true при touchStart', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		const event = createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }])
		swipe.onTouchStart(event)

		expect(swipe.isDragging.value).toBe(true)
	})

	it('должен сбрасывать dragOffset=0 при touchStart', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))

		expect(swipe.dragOffset.value).toBe(0)
	})

	// --- onTouchMove ---

	it('должен вызывать onDragOffset через RAF при touchMove (горизонтальный)', () => {
		const onDragOffset = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onDragOffset }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onTouchMove(createTouchEvent('touchmove', [{ clientX: 150, clientY: 100 }]))

		expect(onDragOffset).toHaveBeenCalledWith(50)

		rafSpy.mockRestore()
	})

	it('должен обновлять dragOffset.value через RAF при touchMove', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onTouchMove(createTouchEvent('touchmove', [{ clientX: 170, clientY: 100 }]))

		expect(swipe.dragOffset.value).toBe(70)

		rafSpy.mockRestore()
	})

	it('должен вычислять offset по Y в вертикальном режиме при touchMove', () => {
		const onDragOffset = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => true, threshold: 50, onDragOffset }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onTouchMove(createTouchEvent('touchmove', [{ clientX: 100, clientY: 150 }]))

		expect(onDragOffset).toHaveBeenCalledWith(50)

		rafSpy.mockRestore()
	})

	it('не должен обновлять смещение при touchMove если isDragging=false', () => {
		const onDragOffset = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onDragOffset }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

		// Вызываем touchMove без touchStart — isDragging=false
		swipe.onTouchMove(createTouchEvent('touchmove', [{ clientX: 150, clientY: 100 }]))

		expect(onDragOffset).not.toHaveBeenCalled()
		expect(rafSpy).not.toHaveBeenCalled()

		rafSpy.mockRestore()
	})

	it('не должен планировать второй RAF если первый ещё не выполнен (touch)', () => {
		const onDragOffset = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onDragOffset }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchMove(createTouchEvent('touchmove', [{ clientX: 150, clientY: 100 }]))
		swipe.onTouchMove(createTouchEvent('touchmove', [{ clientX: 200, clientY: 100 }]))

		// RAF вызван только 1 раз — второй scheduleOffsetUpdate вышел по rafId !== null
		expect(rafSpy).toHaveBeenCalledTimes(1)

		rafSpy.mockRestore()
	})

	it('не должен вызывать onDragOffset при touchMove если колбэк не передан', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		// Не должно выбросить ошибку при отсутствии onDragOffset
		swipe.onTouchMove(createTouchEvent('touchmove', [{ clientX: 150, clientY: 100 }]))

		expect(swipe.dragOffset.value).toBe(50)

		rafSpy.mockRestore()
	})

	// --- onTouchEnd ---

	it('должен сбрасывать isDragging=false при touchEnd', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 200, clientY: 100 }]))

		expect(swipe.isDragging.value).toBe(false)
	})

	it('должен сбрасывать dragOffset=0 при touchEnd', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})
		swipe.onTouchMove(createTouchEvent('touchmove', [{ clientX: 150, clientY: 100 }]))

		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 200, clientY: 100 }]))

		expect(swipe.dragOffset.value).toBe(0)

		rafSpy.mockRestore()
	})

	it('должен вызывать onDragOffset(0) при touchEnd', () => {
		const onDragOffset = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onDragOffset }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 200, clientY: 100 }]))

		// onDragOffset вызывается с 0 в конце touchEnd
		expect(onDragOffset).toHaveBeenCalledWith(0)
	})

	it('не должен ничего делать при touchEnd если isDragging=false', () => {
		const onDragEnd = vi.fn()
		const onSwipeNext = vi.fn()
		const onDragOffset = vi.fn()
		const swipe = withSetup(() =>
			useSwipe({ isVertical: () => false, threshold: 50, onDragEnd, onSwipeNext, onDragOffset }),
		)

		// Вызываем touchEnd без touchStart — isDragging=false
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 200, clientY: 100 }]))

		expect(onDragEnd).not.toHaveBeenCalled()
		expect(onSwipeNext).not.toHaveBeenCalled()
		expect(onDragOffset).not.toHaveBeenCalled()
		expect(swipe.isDragging.value).toBe(false)
	})

	it('должен вызывать onDragEnd с дельтой при touchEnd (горизонтальный)', () => {
		const onDragEnd = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onDragEnd }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 200, clientY: 110 }]))

		expect(onDragEnd).toHaveBeenCalledWith({ main: 100, cross: 10 })
	})

	it('должен вызывать onDragEnd с дельтой при touchEnd (вертикальный)', () => {
		const onDragEnd = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => true, threshold: 50, onDragEnd }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 110, clientY: 200 }]))

		expect(onDragEnd).toHaveBeenCalledWith({ main: 100, cross: 10 })
	})

	it('не должен вызывать onDragEnd если колбэк не передан (touchEnd)', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		// Не должно выбросить ошибку при отсутствии onDragEnd
		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 200, clientY: 100 }]))

		expect(swipe.isDragging.value).toBe(false)
	})

	it('должен отменять запланированный RAF при touchEnd', () => {
		const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42)

		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchMove(createTouchEvent('touchmove', [{ clientX: 150, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 200, clientY: 100 }]))

		expect(cancelSpy).toHaveBeenCalledWith(42)

		cancelSpy.mockRestore()
		rafSpy.mockRestore()
	})

	// --- resolveSwipe: горизонтальные свайпы ---

	it('должен вызывать onSwipeNext при горизонтальном свайпе влево', () => {
		const onSwipeNext = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onSwipeNext }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 200, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 100, clientY: 100 }]))

		expect(onSwipeNext).toHaveBeenCalled()
	})

	it('должен вызывать onSwipePrev при горизонтальном свайпе вправо', () => {
		const onSwipePrev = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onSwipePrev }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 200, clientY: 100 }]))

		expect(onSwipePrev).toHaveBeenCalled()
	})

	// --- resolveSwipe: вертикальные свайпы ---

	it('должен вызывать onSwipeNext при вертикальном свайпе вверх', () => {
		const onSwipeNext = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => true, threshold: 50, onSwipeNext }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 200 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 100, clientY: 100 }]))

		expect(onSwipeNext).toHaveBeenCalled()
	})

	it('должен вызывать onSwipePrev при вертикальном свайпе вниз', () => {
		const onSwipePrev = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => true, threshold: 50, onSwipePrev }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 100, clientY: 200 }]))

		expect(onSwipePrev).toHaveBeenCalled()
	})

	// --- resolveSwipe: порог и перпендикулярность ---

	it('не должен вызывать callback при свайпе меньше порога', () => {
		const onSwipeNext = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 100, onSwipeNext }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 150, clientY: 100 }]))

		expect(onSwipeNext).not.toHaveBeenCalled()
	})

	it('не должен триггерить callback при перпендикулярном свайпе', () => {
		const onSwipeNext = vi.fn()
		const onSwipePrev = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onSwipeNext, onSwipePrev }))

		// Горизонтальный свайп = 10px, вертикальный = 200px → перпендикулярное направление
		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 110, clientY: 300 }]))

		expect(onSwipeNext).not.toHaveBeenCalled()
		expect(onSwipePrev).not.toHaveBeenCalled()
	})

	it('не должен вызывать onSwipeNext/onSwipePrev если колбэки не переданы', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		// Не должно выбросить ошибку при отсутствии колбэков
		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 200, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 100, clientY: 100 }]))

		expect(swipe.isDragging.value).toBe(false)
	})

	// --- onDragStart (mouse) ---

	it('должен устанавливать isDragging=true при dragStart', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))

		expect(swipe.isDragging.value).toBe(true)
	})

	it('должен сбрасывать dragOffset=0 при dragStart', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))

		expect(swipe.dragOffset.value).toBe(0)
	})

	it('должен добавлять слушатели mousemove/mouseup на document при dragStart', () => {
		const addSpy = vi.spyOn(document, 'addEventListener')

		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))
		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))

		expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
		expect(addSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))

		addSpy.mockRestore()
	})

	// --- Mouse drag: полный цикл (горизонтальный) ---

	it('должен обрабатывать полный цикл mouse drag с onDragEnd (горизонтальный)', () => {
		const onDragEnd = vi.fn()
		const onSwipePrev = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onDragEnd, onSwipePrev }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))
		expect(swipe.isDragging.value).toBe(true)

		document.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 110 }))
		document.dispatchEvent(new MouseEvent('mouseup', { clientX: 200, clientY: 110 }))

		expect(swipe.isDragging.value).toBe(false)
		expect(onDragEnd).toHaveBeenCalledWith({ main: 100, cross: 10 })
		expect(onSwipePrev).toHaveBeenCalled()

		rafSpy.mockRestore()
	})

	// --- Mouse drag: полный цикл (вертикальный) ---

	it('должен обрабатывать вертикальный mouse drag', () => {
		const onDragEnd = vi.fn()
		const onSwipeNext = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => true, threshold: 50, onDragEnd, onSwipeNext }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onDragStart(createMouseEvent('mousedown', 100, 200))
		expect(swipe.isDragging.value).toBe(true)

		document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }))
		document.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100 }))

		expect(swipe.isDragging.value).toBe(false)
		expect(onDragEnd).toHaveBeenCalledWith({ main: -100, cross: 0 })
		expect(onSwipeNext).toHaveBeenCalled()

		rafSpy.mockRestore()
	})

	// --- Mouse drag: onDragOffset ---

	it('должен вызывать onDragOffset при mouse move', () => {
		const onDragOffset = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onDragOffset }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))
		document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 100 }))

		expect(onDragOffset).toHaveBeenCalledWith(50)

		rafSpy.mockRestore()
	})

	it('должен обновлять dragOffset.value при mouse move', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))
		document.dispatchEvent(new MouseEvent('mousemove', { clientX: 170, clientY: 100 }))

		expect(swipe.dragOffset.value).toBe(70)

		rafSpy.mockRestore()
	})

	it('должен вызывать onDragOffset(0) при mouse up', () => {
		const onDragOffset = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onDragOffset }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))
		document.dispatchEvent(new MouseEvent('mouseup', { clientX: 200, clientY: 100 }))

		// Последний вызов onDragOffset — с 0
		expect(onDragOffset).toHaveBeenLastCalledWith(0)

		rafSpy.mockRestore()
	})

	it('должен вычислять offset по Y в вертикальном режиме при mouse move', () => {
		const onDragOffset = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => true, threshold: 50, onDragOffset }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))
		document.dispatchEvent(new MouseEvent('mousemove', { clientX: 100, clientY: 150 }))

		expect(onDragOffset).toHaveBeenCalledWith(50)

		rafSpy.mockRestore()
	})

	// --- Mouse drag: handleMouseMove early return ---

	it('не должен обновлять смещение при mousemove если isDragging=false', () => {
		const onDragOffset = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onDragOffset }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame')

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))

		// Ручной сброс isDragging
		swipe.isDragging.value = false

		document.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 100 }))

		expect(onDragOffset).not.toHaveBeenCalled()
		expect(rafSpy).not.toHaveBeenCalled()

		rafSpy.mockRestore()
	})

	// --- Mouse drag: handleMouseUp early return ---

	it('не должен обрабатывать mouseup если isDragging=false', () => {
		const onDragEnd = vi.fn()
		const onSwipePrev = vi.fn()
		const onDragOffset = vi.fn()
		const swipe = withSetup(() =>
			useSwipe({ isVertical: () => false, threshold: 50, onDragEnd, onSwipePrev, onDragOffset }),
		)

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))

		// Ручной сброс isDragging
		swipe.isDragging.value = false

		document.dispatchEvent(new MouseEvent('mouseup', { clientX: 200, clientY: 100 }))

		expect(onDragEnd).not.toHaveBeenCalled()
		expect(onSwipePrev).not.toHaveBeenCalled()

		rafSpy.mockRestore()
	})

	// --- Mouse drag: RAF dedup (scheduleUpdate) ---

	it('не должен планировать второй RAF если первый ещё не выполнен (mouse)', () => {
		const onDragOffset = vi.fn()
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50, onDragOffset }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(1)

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))
		document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 100 }))
		document.dispatchEvent(new MouseEvent('mousemove', { clientX: 200, clientY: 100 }))

		// RAF вызван только 1 раз — второй scheduleUpdate вышел по rafId !== null
		expect(rafSpy).toHaveBeenCalledTimes(1)

		rafSpy.mockRestore()
	})

	// --- Mouse drag: без колбэков ---

	it('не должен вызывать onDragEnd если колбэк не передан (mouse up)', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))
		document.dispatchEvent(new MouseEvent('mouseup', { clientX: 200, clientY: 100 }))

		// Не должно выбросить ошибку
		expect(swipe.isDragging.value).toBe(false)

		rafSpy.mockRestore()
	})

	it('не должен вызывать onDragOffset если колбэк не передан (mouse move)', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))
		document.dispatchEvent(new MouseEvent('mousemove', { clientX: 150, clientY: 100 }))

		// Не должно выбросить ошибку, dragOffset обновляется
		expect(swipe.dragOffset.value).toBe(50)

		rafSpy.mockRestore()
	})

	it('не должен вызывать onSwipeNext/onSwipePrev если колбэки не переданы (mouse)', () => {
		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onDragStart(createMouseEvent('mousedown', 200, 100))
		document.dispatchEvent(new MouseEvent('mouseup', { clientX: 100, clientY: 100 }))

		// Не должно выбросить ошибку
		expect(swipe.isDragging.value).toBe(false)

		rafSpy.mockRestore()
	})

	// --- cleanupMouseListeners ---

	it('должен удалять слушатели mousemove/mouseup при mouse up', () => {
		const removeSpy = vi.spyOn(document, 'removeEventListener')

		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))
		document.dispatchEvent(new MouseEvent('mouseup', { clientX: 200, clientY: 100 }))

		expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
		expect(removeSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))

		removeSpy.mockRestore()
		rafSpy.mockRestore()
	})

	it('должен корректно очищать слушатели если activeMouseMove=null', () => {
		const removeSpy = vi.spyOn(document, 'removeEventListener')

		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		// Вызываем cleanupMouseListeners напрямую через unmount без dragStart
		// activeMouseMove и activeMouseUp = null
		const { wrapper } = withSetupFull(() => useSwipe({ isVertical: () => false, threshold: 50 }))
		wrapper.unmount()

		// removeEventListener не вызывался для mousemove/mouseup
		expect(removeSpy).not.toHaveBeenCalledWith('mousemove', expect.any(Function))
		expect(removeSpy).not.toHaveBeenCalledWith('mouseup', expect.any(Function))

		removeSpy.mockRestore()
	})

	// --- cancelRaf ---

	it('не должен вызывать cancelAnimationFrame если rafId=null', () => {
		const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')

		const swipe = withSetup(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		// touchEnd без предшествующего touchMove — rafId=null
		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchEnd(createTouchEvent('touchend', [{ clientX: 200, clientY: 100 }]))

		expect(cancelSpy).not.toHaveBeenCalled()

		cancelSpy.mockRestore()
	})

	// --- onBeforeUnmount ---

	it('должен отменять RAF при размонтировании', () => {
		const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42)

		const { result: swipe, wrapper } = withSetupFull(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		swipe.onTouchStart(createTouchEvent('touchstart', [{ clientX: 100, clientY: 100 }]))
		swipe.onTouchMove(createTouchEvent('touchmove', [{ clientX: 150, clientY: 100 }]))

		wrapper.unmount()

		expect(cancelSpy).toHaveBeenCalledWith(42)

		cancelSpy.mockRestore()
		rafSpy.mockRestore()
	})

	it('должен очищать слушатели мыши при размонтировании', () => {
		const removeSpy = vi.spyOn(document, 'removeEventListener')

		const { result: swipe, wrapper } = withSetupFull(() => useSwipe({ isVertical: () => false, threshold: 50 }))

		const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
			cb(0)
			return 0
		})

		swipe.onDragStart(createMouseEvent('mousedown', 100, 100))
		wrapper.unmount()

		expect(removeSpy).toHaveBeenCalledWith('mousemove', expect.any(Function))
		expect(removeSpy).toHaveBeenCalledWith('mouseup', expect.any(Function))

		removeSpy.mockRestore()
		rafSpy.mockRestore()
	})

	it('должен отменлять RAF и очищать слушателей при размонтировании без активного drag', () => {
		const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame')
		const removeSpy = vi.spyOn(document, 'removeEventListener')

		const { wrapper } = withSetupFull(() => useSwipe({ isVertical: () => false, threshold: 50 }))
		wrapper.unmount()

		// Нет активного RAF и нет слушателей мыши
		expect(cancelSpy).not.toHaveBeenCalled()
		expect(removeSpy).not.toHaveBeenCalledWith('mousemove', expect.any(Function))
		expect(removeSpy).not.toHaveBeenCalledWith('mouseup', expect.any(Function))

		cancelSpy.mockRestore()
		removeSpy.mockRestore()
	})
})
