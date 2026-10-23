import '@testing-library/jest-dom/vitest'
import { defineComponent, h } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseBottomNav from '../ui/BaseBottomNav.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { BottomNavItem } from '../types/BaseBottomNav.types'

const ITEMS: BottomNavItem[] = [
	{ value: 'home', label: 'Главная', icon: 'home' },
	{ value: 'search', label: 'Поиск', icon: 'search' },
	{ value: 'fav', label: 'Избранное', icon: 'star', activeIcon: 'star-filled' },
]

const LINKS: BottomNavItem[] = [
	{ value: 'home', label: 'Главная', icon: 'home', to: '/' },
	{ value: 'inbox', label: 'Входящие', icon: 'inbox', to: '/inbox' },
	{ value: 'help', label: 'Справка', icon: 'info', href: 'https://example.com', target: '_blank' },
]

function renderNav(props: Record<string, unknown> = {}, options: Record<string, unknown> = {}) {
	return render(BaseBottomNav, { props: { items: ITEMS, ...props }, ...options })
}

function iconHref(element: HTMLElement): string | null | undefined {
	return element.querySelector('use')?.getAttribute('href')
}

let warnSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
	warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
	warnSpy.mockRestore()
})

describe('BaseBottomNav unit: разметка', () => {
	it('рендерит nav с именем из словаря и список пунктов', () => {
		renderNav()
		const nav = screen.getByRole('navigation', { name: 'Нижняя навигация' })
		expect(nav.querySelectorAll('li')).toHaveLength(3)
		expect(screen.getByRole('button', { name: 'Главная' })).toHaveAttribute('type', 'button')
	})

	it('ariaLabel меняет имя ориентира', () => {
		renderNav({ ariaLabel: 'Разделы' })
		expect(screen.getByRole('navigation', { name: 'Разделы' })).toBeInTheDocument()
	})

	it('по умолчанию закреплена внизу, isFixed=false снимает модификатор', async () => {
		const { rerender } = renderNav()
		expect(screen.getByRole('navigation')).toHaveClass('base-bottom-nav--fixed')
		await rerender({ isFixed: false })
		expect(screen.getByRole('navigation')).not.toHaveClass('base-bottom-nav--fixed')
	})

	it('вариант, размер и customClass элементов', () => {
		renderNav({ variant: 'soft', sizeScale: 125, customClass: { root: 'r', list: 'l', item: 'i', link: 'k', label: 'lb' } })
		const nav = screen.getByRole('navigation')
		expect(nav).toHaveClass('base-bottom-nav--soft', 'r')
		expect(nav.getAttribute('style')).toContain('--size-scale')
		expect(nav.querySelector('ul')).toHaveClass('l')
		expect(nav.querySelector('li')).toHaveClass('i')
		expect(screen.getByRole('button', { name: 'Главная' })).toHaveClass('k')
		expect(nav.querySelector('.base-bottom-nav__label')).toHaveClass('lb')
	})

	it('defaults из плагина меняют умолчания', () => {
		renderNav({}, { global: { plugins: [createUiKitPlugin({ defaults: { BaseBottomNav: { isFixed: false } } })] } })
		expect(screen.getByRole('navigation')).not.toHaveClass('base-bottom-nav--fixed')
	})

	it('слоты icon и label получают пункт и isActive', () => {
		renderNav(
			{ modelValue: 'search' },
			{
				slots: {
					icon: ({ item, isActive }: { item: BottomNavItem; isActive: boolean }) => h('i', `${item.value}:${isActive}`),
					label: ({ item, isActive }: { item: BottomNavItem; isActive: boolean }) => (isActive ? h('b', item.label) : item.label),
				},
			},
		)
		expect(screen.getByText('search:true')).toBeInTheDocument()
		expect(screen.getByText('home:false')).toBeInTheDocument()
		expect(screen.getByText('Поиск').tagName).toBe('B')
	})
})

describe('BaseBottomNav unit: выбор', () => {
	it('aria-current и подложка — у пункта из modelValue', async () => {
		const { rerender } = renderNav({ modelValue: 'search' })
		const search = screen.getByRole('button', { name: 'Поиск' })
		expect(search).toHaveAttribute('aria-current', 'page')
		expect(search).toHaveClass('base-bottom-nav__link--active')
		expect(screen.getByRole('button', { name: 'Главная' })).not.toHaveAttribute('aria-current')
		await rerender({ modelValue: 'home' })
		expect(screen.getByRole('button', { name: 'Главная' })).toHaveAttribute('aria-current', 'page')
		await rerender({ modelValue: null })
		expect(screen.queryByRole('button', { current: 'page' })).toBeNull()
	})

	it('без v-model ничего не выбрано, клик выбирает пункт и эмитит события', async () => {
		const { emitted } = renderNav()
		expect(screen.queryByRole('button', { current: 'page' })).toBeNull()
		await fireEvent.click(screen.getByRole('button', { name: 'Поиск' }))
		expect(screen.getByRole('button', { name: 'Поиск' })).toHaveAttribute('aria-current', 'page')
		expect(emitted()['update:modelValue']).toEqual([['search']])
		expect(emitted().select).toEqual([[ITEMS[1]]])
		expect(emitted().navigate).toBeUndefined()
	})

	it('activeIcon — значок выбранного пункта', async () => {
		const { container } = renderNav({ modelValue: 'home' })
		const fav = () => container.querySelectorAll<HTMLElement>('.base-bottom-nav__link')[2]!
		expect(iconHref(fav())).toContain('star')
		expect(iconHref(fav())).not.toContain('star-filled')
		await fireEvent.click(fav())
		expect(iconHref(fav())).toContain('star-filled')
	})

	it('выключенная кнопка: disabled, без событий', async () => {
		const { emitted } = renderNav({ items: [{ ...ITEMS[0]!, isDisabled: true }, ITEMS[1], ITEMS[2]] })
		const home = screen.getByRole('button', { name: 'Главная' })
		expect(home).toBeDisabled()
		expect(home).toHaveClass('base-bottom-nav__link--disabled')
		await fireEvent.click(home)
		expect(emitted().select).toBeUndefined()
	})
})

describe('BaseBottomNav unit: ссылки', () => {
	it('to — <a href> без роутера; клик эмитит navigate, select и v-model', async () => {
		const { emitted } = renderNav({ items: LINKS, modelValue: 'home' })
		const inbox = screen.getByRole('link', { name: 'Входящие' })
		expect(inbox).toHaveAttribute('href', '/inbox')
		expect(screen.getByRole('link', { name: 'Главная' })).toHaveAttribute('aria-current', 'page')
		await fireEvent.click(inbox)
		expect(emitted().navigate).toEqual([['/inbox']])
		expect(emitted()['update:modelValue']).toEqual([['inbox']])
		expect(inbox).toHaveAttribute('aria-current', 'page')
	})

	it('ссылка в новой вкладке и клик с модификатором не меняют выбор', async () => {
		const { emitted } = renderNav({ items: LINKS, modelValue: 'home' })
		const help = screen.getByRole('link', { name: 'Справка' })
		expect(help).toHaveAttribute('rel', 'noopener noreferrer')
		await fireEvent.click(help)
		for (const modifier of ['ctrlKey', 'metaKey', 'shiftKey']) {
			await fireEvent.click(screen.getByRole('link', { name: 'Входящие' }), { [modifier]: true })
		}
		expect(emitted().navigate).toEqual([['https://example.com'], ['/inbox'], ['/inbox'], ['/inbox']])
		expect(emitted().select).toBeUndefined()
		expect(screen.getByRole('link', { name: 'Главная' })).toHaveAttribute('aria-current', 'page')
	})

	it('linkComponent получает to', () => {
		const Stub = defineComponent({
			props: { to: { type: String, required: true } },
			setup:
				(p, { slots }) =>
				() =>
					h('a', { 'data-to': p.to }, slots.default?.()),
		})
		renderNav({ items: LINKS, linkComponent: Stub })
		expect(screen.getByText('Входящие').closest('a')).toHaveAttribute('data-to', '/inbox')
	})

	it('выключенная ссылка: без адреса, aria-disabled, клик отменён', async () => {
		const { emitted } = renderNav({ items: [{ ...LINKS[1]!, isDisabled: true }, LINKS[0], LINKS[2]] })
		const inbox = screen.getByText('Входящие').closest('a')!
		expect(inbox).not.toHaveAttribute('href')
		expect(inbox).toHaveAttribute('aria-disabled', 'true')
		const event = new MouseEvent('click', { bubbles: true, cancelable: true })
		inbox.dispatchEvent(event)
		expect(event.defaultPrevented).toBe(true)
		expect(emitted().navigate).toBeUndefined()
	})
})

describe('BaseBottomNav unit: бейджи', () => {
	const badged = (badge: BottomNavItem['badge'], extra: Partial<BottomNavItem> = {}): BottomNavItem[] => [
		{ ...ITEMS[0]!, badge, ...extra },
		ITEMS[1]!,
		ITEMS[2]!,
	]

	it('число — бейдж и описание «3 новых»', () => {
		const { container } = renderNav({ items: badged(3) })
		const home = screen.getByRole('button', { name: 'Главная' })
		expect(home).toHaveAccessibleDescription('3 новых')
		expect(container.querySelector('.base-bottom-nav__badge')).toHaveTextContent('3')
		expect(container.querySelector('.base-bottom-nav__badge')).toHaveAttribute('aria-hidden', 'true')
	})

	it('число больше maxBadge — «99+», maxBadge меняет предел', async () => {
		const { container, rerender } = renderNav({ items: badged(150) })
		expect(container.querySelector('.base-bottom-nav__badge')).toHaveTextContent('99+')
		expect(screen.getByRole('button', { name: 'Главная' })).toHaveAccessibleDescription('150 новых')
		await rerender({ maxBadge: 9 })
		expect(container.querySelector('.base-bottom-nav__badge')).toHaveTextContent('9+')
	})

	it('строка — как есть, badgeLabel заменяет описание', () => {
		const { container } = renderNav({ items: badged('new', { badgeLabel: 'Есть новое' }) })
		expect(container.querySelector('.base-bottom-nav__badge')).toHaveTextContent('new')
		expect(screen.getByRole('button', { name: 'Главная' })).toHaveAccessibleDescription('Есть новое')
	})

	it('строка без badgeLabel — описание из строки; badgeLabel у числа', () => {
		renderNav({ items: [{ ...ITEMS[0]!, badge: 'Новое' }, { ...ITEMS[1]!, badge: 2, badgeLabel: '2 запроса' }, ITEMS[2]!] })
		expect(screen.getByRole('button', { name: 'Главная' })).toHaveAccessibleDescription('Новое')
		expect(screen.getByRole('button', { name: 'Поиск' })).toHaveAccessibleDescription('2 запроса')
	})

	it.each([0, -1, ''])('бейдж %p не показывается', badge => {
		const { container } = renderNav({ items: badged(badge) })
		expect(container.querySelector('.base-bottom-nav__badge')).toBeNull()
		expect(screen.getByRole('button', { name: 'Главная' })).not.toHaveAttribute('aria-describedby')
	})
})

describe('BaseBottomNav unit: число пунктов', () => {
	it.each([2, 6])('%i пунктов — предупреждение', count => {
		const items = Array.from({ length: count }, (_, index) => ({ value: `v${index}`, label: `П${index}`, icon: 'home' }))
		renderNav({ items })
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining(`пунктов ${count}`))
	})

	it('3–5 пунктов — без предупреждения; смена числа проверяется снова', async () => {
		const { rerender } = renderNav()
		expect(warnSpy).not.toHaveBeenCalled()
		await rerender({ items: ITEMS.slice(0, 1) })
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('пунктов 1'))
	})
})
