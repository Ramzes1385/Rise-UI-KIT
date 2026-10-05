import '@testing-library/jest-dom/vitest'
import BaseBottomNav from '../ui/BaseBottomNav.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BottomNavItem } from '../types/BaseBottomNav.types'
import { getIndicatorStyle, getNotchStyle, getPrimaryIndex } from '../model/bottomNavLayout'

const ITEMS: BottomNavItem[] = [
	{ value: 'home', label: 'Главная', icon: 'home' },
	{ value: 'search', label: 'Поиск', icon: 'search' },
	{ value: 'create', label: 'Создать', icon: 'plus', isPrimary: true },
	{ value: 'chats', label: 'Чаты', icon: 'comment', isPrimary: true },
]

function renderNav(props: Record<string, unknown> = {}) {
	return render(BaseBottomNav, { props: { items: ITEMS, ...props } })
}

function indicatorOf(container: Element): HTMLElement | null {
	return container.querySelector<HTMLElement>('.base-bottom-nav__indicator')
}

describe('BaseBottomNav: функции раскладки', () => {
	it('getPrimaryIndex — первый пункт с isPrimary и только в notched', () => {
		expect(getPrimaryIndex(ITEMS, 'notched')).toBe(2)
		expect(getPrimaryIndex(ITEMS, 'floating')).toBe(-1)
		expect(getPrimaryIndex(ITEMS, undefined)).toBe(-1)
		expect(getPrimaryIndex(ITEMS.slice(0, 2), 'notched')).toBe(-1)
	})

	it('getIndicatorStyle — ширина ячейки и сдвиг на индекс, только для скользящих вариантов', () => {
		expect(getIndicatorStyle('floating', 1, 4)).toEqual({
			width: 'calc((100% - 2 * var(--bottom-nav-bar-padding)) / 4)',
			transform: 'translateX(calc(1 * 100% * var(--bottom-nav-direction)))',
		})
		expect(getIndicatorStyle('glass', 0, 4)).not.toBeNull()
		expect(getIndicatorStyle('glass', -1, 4)).toBeNull()
		expect(getIndicatorStyle('default', 1, 4)).toBeNull()
		expect(getIndicatorStyle(undefined, 1, 4)).toBeNull()
	})

	it('getNotchStyle — центр выреза над главным пунктом', () => {
		expect(getNotchStyle(2, 4)).toEqual({ '--bottom-nav-notch-x': '62.5%' })
		expect(getNotchStyle(-1, 4)).toBeUndefined()
	})
})

describe('BaseBottomNav: варианты floating, glass, notched', () => {
	it.each(['floating', 'glass', 'notched'] as const)('%s — класс варианта на корне', variant => {
		renderNav({ variant })
		expect(screen.getByRole('navigation')).toHaveClass(`base-bottom-nav--${variant}`)
	})

	it('floating: скользящий индикатор у выбранного пункта и сдвиг при выборе другого', async () => {
		const { container } = renderNav({ variant: 'floating', modelValue: 'home' })
		const indicator = indicatorOf(container)
		expect(indicator).toHaveAttribute('aria-hidden', 'true')
		expect(indicator?.style.transform).toContain('0 * 100%')

		await fireEvent.click(screen.getByRole('button', { name: 'Поиск' }))
		expect(indicatorOf(container)?.style.transform).toContain('1 * 100%')
	})

	it('индикатор следует за v-model снаружи', async () => {
		const { container, rerender } = renderNav({ variant: 'glass', modelValue: 'home' })
		await rerender({ items: ITEMS, variant: 'glass', modelValue: 'chats' })
		expect(indicatorOf(container)?.style.transform).toContain('3 * 100%')
	})

	it('без выбранного пункта и в классических вариантах индикатора нет', () => {
		const { container, unmount } = renderNav({ variant: 'glass', modelValue: null })
		expect(indicatorOf(container)).toBeNull()
		unmount()
		const classic = renderNav({ variant: 'default', modelValue: 'home' })
		expect(indicatorOf(classic.container)).toBeNull()
	})

	it('notched: первый пункт с isPrimary — главное действие, вырез над ним', () => {
		const { container } = renderNav({ variant: 'notched' })
		expect(screen.getByRole('button', { name: 'Создать' })).toHaveClass('base-bottom-nav__link--primary')
		expect(screen.getByRole('button', { name: 'Чаты' })).not.toHaveClass('base-bottom-nav__link--primary')
		const bar = container.querySelector<HTMLElement>('.base-bottom-nav__bar')
		expect(bar).toHaveClass('base-bottom-nav__bar--notched')
		expect(bar?.style.getPropertyValue('--bottom-nav-notch-x')).toBe('62.5%')
	})

	it('notched без isPrimary — панель без выреза', () => {
		const { container } = renderNav({ variant: 'notched', items: ITEMS.slice(0, 2) })
		expect(container.querySelector('.base-bottom-nav__bar')).not.toHaveClass('base-bottom-nav__bar--notched')
		expect(container.querySelector('.base-bottom-nav__link--primary')).toBeNull()
	})

	it('isPrimary в других вариантах — обычный пункт', () => {
		renderNav({ variant: 'floating' })
		expect(screen.getByRole('button', { name: 'Создать' })).not.toHaveClass('base-bottom-nav__link--primary')
	})

	it('главное действие выбирается как обычный пункт', async () => {
		const { emitted } = renderNav({ variant: 'notched', modelValue: 'home' })
		const create = screen.getByRole('button', { name: 'Создать' })
		await fireEvent.click(create)
		expect(create).toHaveAttribute('aria-current', 'page')
		expect(emitted()['update:modelValue']).toEqual([['create']])
	})

	it('customClass.bar попадает на обёртку списка', () => {
		const { container } = renderNav({ customClass: { bar: 'my-bar' } })
		expect(container.querySelector('.base-bottom-nav__bar')).toHaveClass('my-bar')
	})
})
