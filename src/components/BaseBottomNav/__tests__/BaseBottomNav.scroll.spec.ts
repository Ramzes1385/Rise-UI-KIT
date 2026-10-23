import '@testing-library/jest-dom/vitest'
import BaseBottomNav from '../ui/BaseBottomNav.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BottomNavItem } from '../types/BaseBottomNav.types'

const ITEMS: BottomNavItem[] = [
	{ value: 'home', label: 'Главная', icon: 'home' },
	{ value: 'search', label: 'Поиск', icon: 'search' },
	{ value: 'fav', label: 'Избранное', icon: 'star' },
]

async function scrollTo(y: number): Promise<void> {
	Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
	await fireEvent.scroll(window)
}

function nav(): HTMLElement {
	return screen.getByRole('navigation')
}

beforeEach(async () => {
	await scrollTo(0)
})

describe('BaseBottomNav: hideOnScroll', () => {
	it('прячется при прокрутке вниз и возвращается при прокрутке вверх', async () => {
		render(BaseBottomNav, { props: { items: ITEMS, hideOnScroll: true } })
		await scrollTo(200)
		expect(nav()).toHaveClass('base-bottom-nav--hidden')
		await scrollTo(195)
		expect(nav()).toHaveClass('base-bottom-nav--hidden')
		await scrollTo(100)
		expect(nav()).not.toHaveClass('base-bottom-nav--hidden')
	})

	it('без hideOnScroll прокрутка ничего не меняет', async () => {
		render(BaseBottomNav, { props: { items: ITEMS } })
		await scrollTo(300)
		expect(nav()).not.toHaveClass('base-bottom-nav--hidden')
	})

	it('фокус внутри показывает панель и не даёт спрятать', async () => {
		render(BaseBottomNav, { props: { items: ITEMS, hideOnScroll: true } })
		await scrollTo(200)
		const home = screen.getByRole('button', { name: 'Главная' })
		await fireEvent.focusIn(home)
		expect(nav()).not.toHaveClass('base-bottom-nav--hidden')
		await scrollTo(400)
		expect(nav()).not.toHaveClass('base-bottom-nav--hidden')

		await fireEvent.focusOut(home, { relatedTarget: screen.getByRole('button', { name: 'Поиск' }) })
		await scrollTo(600)
		expect(nav()).not.toHaveClass('base-bottom-nav--hidden')

		await fireEvent.focusOut(home, { relatedTarget: document.body })
		await scrollTo(800)
		expect(nav()).toHaveClass('base-bottom-nav--hidden')
	})

	it('выключение hideOnScroll показывает панель и снимает слушатель', async () => {
		const { rerender } = render(BaseBottomNav, { props: { items: ITEMS, hideOnScroll: true } })
		await scrollTo(200)
		expect(nav()).toHaveClass('base-bottom-nav--hidden')
		await rerender({ hideOnScroll: false })
		expect(nav()).not.toHaveClass('base-bottom-nav--hidden')
		await scrollTo(500)
		expect(nav()).not.toHaveClass('base-bottom-nav--hidden')
		await rerender({ hideOnScroll: true })
		await scrollTo(700)
		expect(nav()).toHaveClass('base-bottom-nav--hidden')
	})

	it('снимает слушатель прокрутки при размонтировании', () => {
		const removeSpy = vi.spyOn(window, 'removeEventListener')
		const { unmount } = render(BaseBottomNav, { props: { items: ITEMS, hideOnScroll: true } })
		unmount()
		expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
		removeSpy.mockRestore()
	})
})
