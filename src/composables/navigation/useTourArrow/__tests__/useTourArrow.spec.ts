/** Окно jsdom — 1024 × 768. Карточка измеряется по offset*, поэтому они подменяются. */

import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { TourCardBox } from '../types/useTourArrow.types'
import type { TourGeometry } from '@components/BaseTour/types/BaseTour.types'
import { fitDesktopCard, fitMobileCard, TOUR_ARROW_EDGE_OFFSET, TOUR_VIEWPORT_MARGIN, useTourArrow } from '../useTourArrow'

const VIEWPORT = { width: 1024, height: 768 }

function geometry(
	placement: TourGeometry['placement'],
	target: { x: number; y: number },
	card: { top: number; left: number },
): TourGeometry {
	return { spotlight: { top: target.y - 20, left: target.x - 40, width: 80, height: 40 }, card, placement }
}

function box(width: number, height: number, position: { left?: number; top?: number } = {}): TourCardBox {
	return { width, height, left: position.left ?? 0, top: position.top ?? 0 }
}

function createCard(size: TourCardBox): HTMLElement {
	const card = document.createElement('div')
	Object.defineProperty(card, 'offsetWidth', { value: size.width })
	Object.defineProperty(card, 'offsetHeight', { value: size.height })
	Object.defineProperty(card, 'offsetLeft', { value: size.left })
	Object.defineProperty(card, 'offsetTop', { value: size.top })
	return card
}

describe('fitDesktopCard', () => {
	it('карточка снизу по центру цели — стрелка на верхнем крае посередине, без сдвига', () => {
		const fit = fitDesktopCard(geometry('bottom', { x: 500, y: 100 }, { top: 132, left: 500 }), box(320, 200), VIEWPORT)

		expect(fit).toEqual({ side: 'top', shift: 0, offset: 160 })
	})

	it('цель у правого края — карточка сдвигается влево, стрелка остаётся напротив цели', () => {
		const fit = fitDesktopCard(geometry('top', { x: 990, y: 400 }, { top: 368, left: 990 }), box(320, 200), VIEWPORT)

		const left = VIEWPORT.width - 320 - TOUR_VIEWPORT_MARGIN
		expect(fit).toEqual({ side: 'bottom', shift: left - (990 - 160), offset: 990 - left })
	})

	it('цель у самого края — стрелка не заходит на скругление угла', () => {
		const fit = fitDesktopCard(geometry('bottom', { x: 1020, y: 100 }, { top: 132, left: 1020 }), box(320, 200), VIEWPORT)

		expect(fit.offset).toBe(320 - TOUR_ARROW_EDGE_OFFSET)
	})

	it('карточка шире окна — прижимается к левому краю', () => {
		const fit = fitDesktopCard(geometry('bottom', { x: 200, y: 100 }, { top: 132, left: 200 }), box(1200, 200), VIEWPORT)

		expect(fit.shift).toBe(TOUR_VIEWPORT_MARGIN - (200 - 600))
	})

	it.each([
		['right', 'left', { top: 20, left: 200 }],
		['left', 'right', { top: 20, left: 600 }],
	] as const)('карточка %s у цели у верхнего края — сдвиг вниз, стрелка на крае %s', (placement, side, card) => {
		const fit = fitDesktopCard(geometry(placement, { x: 400, y: 20 }, card), box(320, 200), VIEWPORT)

		expect(fit).toEqual({ side, shift: TOUR_VIEWPORT_MARGIN - (20 - 100), offset: TOUR_ARROW_EDGE_OFFSET })
	})

	it('край карточки короче двух отступов — стрелка посередине', () => {
		const fit = fitDesktopCard(geometry('right', { x: 400, y: 300 }, { top: 300, left: 450 }), box(320, 20), VIEWPORT)

		expect(fit.offset).toBe(10)
	})
})

describe('fitMobileCard', () => {
	it('цель выше карточки — стрелка на верхнем крае напротив цели', () => {
		expect(fitMobileCard(geometry('bottom', { x: 300, y: 200 }, { top: 0, left: 0 }), box(350, 200, { left: 12, top: 550 }))).toEqual({
			side: 'top',
			shift: 0,
			offset: 288,
		})
	})

	it('цель под карточкой — стрелки нет', () => {
		expect(
			fitMobileCard(geometry('top', { x: 300, y: 600 }, { top: 0, left: 0 }), box(350, 200, { left: 12, top: 550 })).side,
		).toBeNull()
	})
})

describe('useTourArrow', () => {
	function setup(initial: { card?: HTMLElement | null; geometry?: TourGeometry | null; isMobile?: boolean } = {}) {
		const cardRef = ref<HTMLElement | null>(null)
		const geometryRef = ref<TourGeometry | null>(
			initial.geometry === undefined ? geometry('bottom', { x: 500, y: 100 }, { top: 132, left: 500 }) : initial.geometry,
		)
		const isMobile = ref(initial.isMobile ?? false)
		let api!: ReturnType<typeof useTourArrow>
		const wrapper = mount({
			setup() {
				api = useTourArrow({ cardRef, geometry: geometryRef, isMobile })
				return () => null
			},
		})
		return { api, cardRef, geometryRef, isMobile, wrapper }
	}

	it('до появления карточки стрелки нет', () => {
		const { api } = setup()

		expect(api.arrowSide.value).toBeNull()
		expect(api.arrowStyle.value).toEqual({ '--tour-card-shift': '0px', '--tour-arrow-offset': '0px' })
	})

	it('карточка появилась — стрелка напротив цели; мобильный режим и новый шаг пересчитывают', async () => {
		const { api, cardRef, isMobile, geometryRef } = setup()

		cardRef.value = createCard(box(320, 200, { left: 12, top: 500 }))
		await nextTick()
		expect(api.arrowSide.value).toBe('top')
		expect(api.arrowStyle.value['--tour-arrow-offset']).toBe('160px')

		isMobile.value = true
		await nextTick()
		await nextTick()
		expect(api.fit.value).toEqual({ side: 'top', shift: 0, offset: 320 - TOUR_ARROW_EDGE_OFFSET })

		geometryRef.value = null
		await nextTick()
		await nextTick()
		expect(api.arrowSide.value).toBeNull()
	})

	it('карточка нулевого размера — стрелки нет', async () => {
		const { api, cardRef } = setup()

		cardRef.value = createCard(box(0, 0))
		await nextTick()
		expect(api.arrowSide.value).toBeNull()
	})

	it('наблюдает размер карточки, при смене и размонтировании отключается', async () => {
		const observers: { callback: () => void; disconnect: ReturnType<typeof vi.fn> }[] = []
		vi.stubGlobal(
			'ResizeObserver',
			class {
				disconnect = vi.fn()
				callback: () => void
				constructor(callback: () => void) {
					this.callback = callback
					observers.push(this)
				}
				observe() {}
			},
		)
		const { api, cardRef, wrapper } = setup()

		cardRef.value = createCard(box(320, 200))
		await nextTick()
		expect(observers).toHaveLength(1)

		cardRef.value = createCard(box(200, 100))
		await nextTick()
		expect(observers[0].disconnect).toHaveBeenCalled()
		observers[1].callback()
		expect(api.arrowStyle.value['--tour-arrow-offset']).toBe('100px')

		cardRef.value = null
		await nextTick()
		expect(observers[1].disconnect).toHaveBeenCalled()

		wrapper.unmount()
		vi.unstubAllGlobals()
	})

	it('размер окна — без полосы прокрутки (clientWidth), когда он известен', async () => {
		vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1000)
		const { api, cardRef } = setup({ geometry: geometry('bottom', { x: 990, y: 100 }, { top: 132, left: 990 }) })

		cardRef.value = createCard(box(320, 200))
		await nextTick()
		expect(api.fit.value.shift).toBe(1000 - 320 - TOUR_VIEWPORT_MARGIN - (990 - 160))
		vi.restoreAllMocks()
	})
})
