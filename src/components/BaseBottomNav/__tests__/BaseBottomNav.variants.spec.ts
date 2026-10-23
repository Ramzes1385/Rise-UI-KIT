import '@testing-library/jest-dom/vitest'
import BaseBottomNav from '../ui/BaseBottomNav.vue'
import type { BottomNavItem } from '../types/BaseBottomNav.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { getNotchStyle, getPrimaryIndex, isCellIndicator } from '../model/bottomNavLayout'

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

	it('isCellIndicator — индикатор во всю ячейку только у floating и glass', () => {
		expect(isCellIndicator('floating')).toBe(true)
		expect(isCellIndicator('glass')).toBe(true)
		expect(isCellIndicator('default')).toBe(false)
		expect(isCellIndicator(undefined)).toBe(false)
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

	it('floating: индикатор у выбранного пункта, пункты-ячейки помечены для замера', async () => {
		const { container } = renderNav({ variant: 'floating', modelValue: 'home' })
		await waitFor(() => expect(indicatorOf(container)).toHaveAttribute('aria-hidden', 'true'))
		expect(container.querySelectorAll('li[data-indicator-item]')).toHaveLength(ITEMS.length)
		expect(container.querySelector('.base-bottom-nav__icon-wrap[data-indicator-item]')).toBeNull()
	})

	it('классические варианты: индикатор — «пилюля» под значком, замер по обёртке значка', async () => {
		const { container } = renderNav({ variant: 'default', modelValue: 'home' })
		await waitFor(() => expect(indicatorOf(container)).not.toBeNull())
		expect(container.querySelectorAll('.base-bottom-nav__icon-wrap[data-indicator-item]')).toHaveLength(ITEMS.length)
		expect(container.querySelector('li[data-indicator-item]')).toBeNull()
	})

	it('без выбранного пункта индикатора нет', async () => {
		const { container } = renderNav({ variant: 'glass', modelValue: null })
		await Promise.resolve()
		expect(indicatorOf(container)).toBeNull()
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
		const { container } = renderNav({ variant: 'notched', items: [...ITEMS.slice(0, 2), { ...ITEMS[2], isPrimary: false }] })
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
