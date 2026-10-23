import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseSlider from '../../ui/BaseSlider.vue'
import userEvent from '@testing-library/user-event'
import type { SliderItem } from '../../types/BaseSlider.types'
import { fireEvent, render, screen } from '@testing-library/vue'

const ITEMS: SliderItem[] = [1, 2, 3, 4].map(n => ({ src: `slide${n}.jpg`, alt: `Слайд ${n}` }))

function thumb(number: number): HTMLElement {
	return document.querySelectorAll<HTMLElement>('.base-slider__thumb')[number - 1]!
}

function rect(top: number, left: number, size = 50): DOMRect {
	return { top, left, bottom: top + size, right: left + size, width: size, height: size, x: left, y: top, toJSON: () => ({}) }
}

function mockStripStyle(flexDirection: string, padding = '4px'): void {
	const original = window.getComputedStyle
	vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudo) => {
		if (!(element as HTMLElement).classList?.contains('base-slider__thumbs')) return original(element, pseudo)
		return {
			flexDirection,
			paddingTop: padding,
			paddingBottom: padding,
			paddingLeft: padding,
			paddingRight: padding,
		} as CSSStyleDeclaration
	})
}

function mockOverflow(isOverflowing: boolean): void {
	vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(isOverflowing ? 400 : 100)
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(100)
}

function mockReducedMotion(matches: boolean): void {
	vi.stubGlobal(
		'matchMedia',
		vi.fn(() => ({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
	)
}

async function flush(): Promise<void> {
	await nextTick()
	await nextTick()
}

describe('BaseSlider: миниатюры', () => {
	let scrollTo: ReturnType<typeof vi.fn>

	beforeEach(() => {
		scrollTo = vi.fn()
		HTMLElement.prototype.scrollTo = scrollTo as unknown as typeof HTMLElement.prototype.scrollTo
	})

	afterEach(() => {
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
	})

	describe('пропс thumbnailsPosition', () => {
		it('по умолчанию bottom: класса боковой ленты нет, обёртка тела есть', () => {
			const { container } = render(BaseSlider, { props: { items: ITEMS, navigation: 'thumbnails' } })
			const root = container.querySelector('.base-slider')!

			expect(root.className).not.toMatch(/base-slider--thumbs-/)
			expect(root.querySelector(':scope > .base-slider__body > .base-slider__stage')).toBeInTheDocument()
			expect(root.querySelector(':scope > .base-slider__body > .base-slider__navigation')).toBeInTheDocument()
		})

		it.each([
			['left', 'thumbnails'],
			['right', 'both'],
		] as const)('%s при navigation=%s — класс base-slider--thumbs-%s', (position, navigation) => {
			const { container } = render(BaseSlider, { props: { items: ITEMS, navigation, thumbnailsPosition: position } })

			expect(container.querySelector('.base-slider')).toHaveClass(`base-slider--thumbs-${position}`)
		})

		it('без миниатюр (navigation=dots) боковая раскладка не включается', () => {
			const { container } = render(BaseSlider, { props: { items: ITEMS, navigation: 'dots', thumbnailsPosition: 'left' } })

			expect(container.querySelector('.base-slider')!.className).not.toMatch(/base-slider--thumbs-/)
		})

		it('значение по умолчанию задаётся настройками плагина (kitDefaults)', () => {
			const { container } = render(BaseSlider, {
				props: { items: ITEMS, navigation: 'thumbnails' },
				global: { plugins: [createUiKitPlugin({ defaults: { BaseSlider: { thumbnailsPosition: 'right' } } })] },
			})

			expect(container.querySelector('.base-slider')).toHaveClass('base-slider--thumbs-right')
		})
	})

	describe('прокрутка к текущей миниатюре', () => {
		it('лента без прокрутки не прокручивается', async () => {
			mockOverflow(false)
			render(BaseSlider, { props: { items: ITEMS, navigation: 'thumbnails' } })
			await flush()

			await userEvent.click(thumb(4))
			await flush()

			expect(scrollTo).not.toHaveBeenCalled()
		})

		it('миниатюра ниже видимой части — лента докручивается до неё с учётом отступа, плавно', async () => {
			mockOverflow(true)
			mockReducedMotion(false)
			mockStripStyle('column')
			render(BaseSlider, { props: { items: ITEMS, navigation: 'thumbnails', thumbnailsPosition: 'right' } })
			await flush()
			const strip = document.querySelector<HTMLElement>('.base-slider__thumbs')!
			vi.spyOn(strip, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 100))
			vi.spyOn(thumb(4), 'getBoundingClientRect').mockReturnValue(rect(130, 10, 50))
			scrollTo.mockClear()

			await userEvent.click(thumb(4))
			await flush()

			expect(scrollTo).toHaveBeenLastCalledWith({ top: 84, left: 0, behavior: 'smooth' })
		})

		it('миниатюра левее видимой части — прокрутка назад; при reduced motion без анимации', async () => {
			mockOverflow(true)
			mockReducedMotion(true)
			mockStripStyle('row', '')
			render(BaseSlider, { props: { items: ITEMS, navigation: 'thumbnails', initialIndex: 3 } })
			await flush()
			const strip = document.querySelector<HTMLElement>('.base-slider__thumbs')!
			strip.scrollLeft = 100
			strip.scrollTop = 0
			vi.spyOn(strip, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 100))
			vi.spyOn(thumb(1), 'getBoundingClientRect').mockReturnValue(rect(-20, -60, 50))

			await userEvent.click(thumb(1))
			await flush()

			expect(scrollTo).toHaveBeenLastCalledWith({ top: -20, left: 40, behavior: 'auto' })
		})

		it('видимая миниатюра не сдвигает ленту, фокус не уходит с нажатой кнопки', async () => {
			mockOverflow(true)
			mockStripStyle('row')
			render(BaseSlider, { props: { items: ITEMS, navigation: 'thumbnails' } })
			await flush()
			const strip = document.querySelector<HTMLElement>('.base-slider__thumbs')!
			vi.spyOn(strip, 'getBoundingClientRect').mockReturnValue(rect(0, 0, 200))
			vi.spyOn(thumb(2), 'getBoundingClientRect').mockReturnValue(rect(10, 60, 50))

			await userEvent.click(thumb(2))
			await flush()

			expect(scrollTo).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: 'smooth' })
			expect(document.activeElement).toBe(thumb(2))
		})

		it('смена слайда стрелкой прокручивает ленту, но фокус остаётся на стрелке', async () => {
			mockOverflow(true)
			mockStripStyle('row')
			render(BaseSlider, { props: { items: ITEMS, navigation: 'thumbnails' } })
			await flush()
			scrollTo.mockClear()
			const next = screen.getByRole('button', { name: 'Следующий слайд' })

			await userEvent.click(next)
			await flush()

			expect(scrollTo).toHaveBeenCalledTimes(1)
			expect(document.activeElement).toBe(next)
		})
	})

	describe('клавиатура по миниатюрам', () => {
		it('вертикальная лента: ↓ и ↑ переводят фокус и слайд, по кругу', async () => {
			mockStripStyle('column')
			const { emitted } = render(BaseSlider, { props: { items: ITEMS, navigation: 'thumbnails', thumbnailsPosition: 'left' } })
			thumb(1).focus()

			await userEvent.keyboard('{ArrowDown}')
			expect(document.activeElement).toBe(thumb(2))
			expect(thumb(2)).toHaveAttribute('aria-current', 'true')

			await userEvent.keyboard('{ArrowUp}{ArrowUp}')
			expect(document.activeElement).toBe(thumb(4))
			expect(emitted().change).toEqual([[1], [0], [3]])
		})

		it('вертикальная лента не реагирует на ← и →', async () => {
			mockStripStyle('column-reverse')
			const { emitted } = render(BaseSlider, { props: { items: ITEMS, navigation: 'thumbnails', thumbnailsPosition: 'right' } })
			thumb(1).focus()

			await userEvent.keyboard('{ArrowRight}{ArrowLeft}')

			expect(document.activeElement).toBe(thumb(1))
			expect(emitted().change).toBeUndefined()
		})

		it('горизонтальная лента: → и ←, Home и End; ↓ не листает', async () => {
			mockStripStyle('row')
			const { emitted } = render(BaseSlider, { props: { items: ITEMS, navigation: 'both' } })
			thumb(2).focus()

			await userEvent.keyboard('{ArrowRight}')
			expect(document.activeElement).toBe(thumb(3))
			await userEvent.keyboard('{End}')
			expect(document.activeElement).toBe(thumb(4))
			await userEvent.keyboard('{Home}')
			expect(document.activeElement).toBe(thumb(1))
			await userEvent.keyboard('{ArrowLeft}')
			expect(document.activeElement).toBe(thumb(4))
			await userEvent.keyboard('{ArrowDown}')

			expect(document.activeElement).toBe(thumb(4))
			expect(emitted().change).toEqual([[2], [3], [0], [3]])
		})

		it('Enter на миниатюре по-прежнему выбирает слайд', async () => {
			mockStripStyle('row')
			const { emitted } = render(BaseSlider, { props: { items: ITEMS, navigation: 'thumbnails' } })
			thumb(3).focus()

			await userEvent.keyboard('{Enter}')

			expect(emitted().change).toEqual([[2]])
		})
	})

	describe('жесты на области слайдов', () => {
		function viewport(): HTMLElement {
			return document.querySelector<HTMLElement>('.base-slider__viewport')!
		}

		beforeEach(() => {
			vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(400)
		})

		it('свайп пальцем влево листает вперёд, отменённое касание — нет', async () => {
			const { emitted } = render(BaseSlider, { props: { items: ITEMS } })

			await fireEvent.touchStart(viewport(), { touches: [{ clientX: 300, clientY: 10 }] })
			await fireEvent.touchMove(viewport(), { touches: [{ clientX: 100, clientY: 10 }] })
			await fireEvent.touchEnd(viewport(), { changedTouches: [{ clientX: 100, clientY: 10 }] })
			await fireEvent.touchStart(viewport(), { touches: [{ clientX: 300, clientY: 10 }] })
			await fireEvent.touchCancel(viewport())

			expect(emitted().change).toEqual([[1]])
		})

		it('перетаскивание мышью листает, клик после перетаскивания гасится, нативный dragstart отменён', async () => {
			const { emitted } = render(BaseSlider, { props: { items: ITEMS } })

			await fireEvent.mouseDown(viewport(), { clientX: 300, clientY: 10, button: 0 })
			await fireEvent.mouseMove(document, { clientX: 100, clientY: 10 })
			await fireEvent.mouseUp(document, { clientX: 100, clientY: 10 })
			const click = new MouseEvent('click', { bubbles: true, cancelable: true })
			viewport().dispatchEvent(click)
			const drag = new Event('dragstart', { bubbles: true, cancelable: true })
			viewport().dispatchEvent(drag)

			expect(emitted().change).toEqual([[1]])
			expect(drag.defaultPrevented).toBe(true)
		})
	})
})
