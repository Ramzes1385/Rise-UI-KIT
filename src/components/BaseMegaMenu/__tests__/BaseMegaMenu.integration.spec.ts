import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { nextTick } from 'vue'
import BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { openExternalUrl } from '@utils/navigation/navigationUtils'

vi.mock('@utils/navigation/navigationUtils', () => {
	const openExternalUrl = vi.fn()
	return {
		openExternalUrl,
		navigateAndEmit: (options: { to?: string; href?: string; target?: string }, emitFn: (url: string) => void) => {
			if (options.href) {
				if (options.target === '_self') {
					window.location.href = options.href
				} else {
					openExternalUrl(options.href)
				}
				emitFn(options.href)
			} else if (options.to) {
				emitFn(options.to)
			}
		},
	}
})

const COLUMNS: any[] = [
	{
		title: 'Каталог',
		icon: 'folder',
		items: [
			{ label: 'Кованые изделия', description: 'Ручная ковка' },
			{ label: 'Ворота и ограды', to: '/gates' },
			{ label: 'Отключенный элемент', isDisabled: true, to: '/disabled' },
			{
				label: 'Лестницы',
				children: [
					{ label: 'Винтовые', to: '/spiral' },
					{ label: 'Маршевые', href: 'https://example.com/stairs', target: '_blank' as const },
					{ label: 'Отключенный саб', isDisabled: true, to: '/sub-disabled' },
				],
			},
		],
	},
	{
		title: 'О компании',
		items: [{ label: 'Наша история' }],
	},
]

const DROPDOWN_ITEMS: any[] = [
	{
		label: 'Каталог',
		icon: 'folder',
		children: [
			{
				label: 'Кованые изделия',
				description: 'Ручная ковка',
				children: [
					{ label: 'Ворота', to: '/gates' },
					{ label: 'Ограды', href: 'https://example.com/fences', target: '_self' as const },
					{ label: 'Отключенный суб-дроп', isDisabled: true, to: '/sub-disabled' },
				],
			},
			{ label: 'Лестницы', to: '/stairs' },
			{ label: 'Отключенный дочерний', isDisabled: true, to: '/disabled' },
		],
	},
	{ label: 'Контакты', href: 'https://example.com', target: '_blank' as const },
	{ label: 'Отключенный пункт навигации', isDisabled: true, to: '/disabled-nav' },
]

function setWindowWidth(width: number) {
	Object.defineProperty(window, 'innerWidth', {
		writable: true,
		configurable: true,
		value: width,
	})
	window.dispatchEvent(new Event('resize'))
}

describe('BaseMegaMenu integration', () => {
	let locationHref = ''

	beforeAll(() => {
		const mockLocation = {
			get href() {
				return locationHref
			},
			set href(val) {
				locationHref = val
			},
		}
		Object.defineProperty(window, 'location', {
			value: mockLocation,
			writable: true,
			configurable: true,
		})
	})

	beforeEach(() => {
		setWindowWidth(1024)
		vi.clearAllMocks()
		locationHref = ''
	})

	describe('Columns Layout - Click Trigger', () => {
		it('должен открывать и закрывать колонку при клике на заголовок на мобильном', async () => {
			setWindowWidth(375)

			const { container, emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			expect(container.querySelector('.base-mega-menu__list')).not.toBeInTheDocument()

			const title = screen.getByText('Каталог')
			await fireEvent.click(title)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__list')).toBeInTheDocument()
			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents).toHaveProperty('column-click')
			expect(emittedEvents['column-click'][0][0]).toEqual(COLUMNS[0])

			await fireEvent.click(title)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__list')).not.toBeInTheDocument()
		})

		it('должен открывать колонку по клику на мобильном даже при триггере hover (форс-click)', async () => {
			setWindowWidth(375)

			const { container, emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover' },
			})

			expect(container.querySelector('.base-mega-menu__list')).not.toBeInTheDocument()

			const title = screen.getByText('Каталог')
			await fireEvent.click(title)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__list')).toBeInTheDocument()
			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents).toHaveProperty('column-click')
		})

		it('должен обрабатывать клик по узлу без детей (навигация)', async () => {
			const { emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			const item = screen.getByText('Ворота и ограды')
			await fireEvent.click(item)
			await nextTick()

			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents).toHaveProperty('item-click')
			expect(emittedEvents['item-click'][0][0]).toEqual(COLUMNS[0].items[1])
			expect(emittedEvents).toHaveProperty('navigate')
			expect(emittedEvents['navigate'][0][0]).toBe('/gates')
		})

		it('не должен обрабатывать клик по отключенному узлу', async () => {
			const { emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			const item = screen.getByText('Отключенный элемент')
			await fireEvent.click(item)
			await nextTick()

			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents).not.toHaveProperty('item-click')
			expect(emittedEvents).not.toHaveProperty('navigate')
		})

		it('должен открывать и закрывать подсписок при клике на узел с детьми', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			expect(container.querySelector('.base-mega-menu__sub-list')).not.toBeInTheDocument()

			const item = screen.getByText('Лестницы')
			await fireEvent.click(item)
			await nextTick()

			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents).toHaveProperty('item-click')
			expect(container.querySelector('.base-mega-menu__sub-list')).toBeInTheDocument()

			await fireEvent.click(item)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__sub-list')).not.toBeInTheDocument()
		})

		it('должен обрабатывать клик по подузлу', async () => {
			const { emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			await fireEvent.click(screen.getByText('Лестницы'))
			await nextTick()

			const subItem = screen.getByText('Винтовые')
			await fireEvent.click(subItem)
			await nextTick()

			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents).toHaveProperty('navigate')
			expect(emittedEvents['navigate'][0][0]).toBe('/spiral')
		})

		it('не должен обрабатывать клик по отключенному подузлу', async () => {
			const { emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			await fireEvent.click(screen.getByText('Лестницы'))
			await nextTick()

			const subItem = screen.getByText('Отключенный саб')
			await fireEvent.click(subItem)
			await nextTick()

			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents).not.toHaveProperty('navigate')
		})

		it('подузел с href — ссылка с target="_blank" и rel; клик эмитит navigate', async () => {
			const { emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			await fireEvent.click(screen.getByText('Лестницы'))
			await nextTick()

			const link = screen.getByRole('link', { name: /Маршевые/ })
			expect(link).toHaveAttribute('href', 'https://example.com/stairs')
			expect(link).toHaveAttribute('target', '_blank')
			expect(link).toHaveAttribute('rel', 'noopener noreferrer')
			link.addEventListener('click', event => event.preventDefault())
			await fireEvent.click(link)

			expect(openExternalUrl).not.toHaveBeenCalled()
			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents['navigate'][0][0]).toBe('https://example.com/stairs')
		})
	})

	describe('Columns Layout - Hover Trigger', () => {
		beforeEach(() => vi.useFakeTimers())
		afterEach(() => vi.useRealTimers())

		it('должен показывать списки колонок на десктопе (колонки всегда раскрыты)', async () => {
			setWindowWidth(1024)

			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover', hoverDelay: 200 },
			})

			const columnElement = container.querySelector('.base-mega-menu__column')
			expect(columnElement).toBeInTheDocument()
			expect(container.querySelector('.base-mega-menu__list')).toBeInTheDocument()

			await fireEvent.mouseEnter(columnElement!)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__list')).toBeInTheDocument()
		})

		it('не должен реагировать на hover колонки в аккордеон-режиме (мобильный)', async () => {
			setWindowWidth(375)

			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover', hoverDelay: 200 },
			})

			const columnElement = container.querySelector('.base-mega-menu__column')
			expect(columnElement).toBeInTheDocument()

			await fireEvent.mouseEnter(columnElement!)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__list')).not.toBeInTheDocument()
		})

		it('должен открывать подсписок при наведении на узел и закрывать при уходе', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover', hoverDelay: 200 },
			})

			const itemElement = screen.getByText('Лестницы').closest('.base-mega-menu__node')
			expect(itemElement).toBeInTheDocument()

			await fireEvent.mouseEnter(itemElement!)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__sub-list')).toBeInTheDocument()

			await fireEvent.mouseLeave(itemElement!)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__sub-list')).toBeInTheDocument()

			vi.advanceTimersByTime(200)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__sub-list')).not.toBeInTheDocument()
		})
	})

	describe('Dropdown Layout - Click Trigger', () => {
		it('должен открывать и закрывать dropdown при клике на пункт навигации', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			expect(container.querySelector('.base-mega-menu__dropdown')).not.toBeInTheDocument()

			const navLink = screen.getByText('Каталог')
			await fireEvent.click(navLink)
			await nextTick()

			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents).toHaveProperty('item-click')
			expect(container.querySelector('.base-mega-menu__dropdown')).toBeInTheDocument()

			await fireEvent.click(navLink)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__dropdown')).not.toBeInTheDocument()
		})

		it('не должен открывать dropdown при клике на отключенный пункт навигации', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			const navLink = screen.getByText('Отключенный пункт навигации')
			await fireEvent.click(navLink)
			await nextTick()

			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents).not.toHaveProperty('item-click')
			expect(container.querySelector('.base-mega-menu__dropdown')).not.toBeInTheDocument()
		})

		it('должен переходить по ссылке при клике на пункт навигации без детей', async () => {
			const { emitted } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			const navLink = screen.getByText('Контакты')
			await fireEvent.click(navLink)
			await nextTick()

			expect(openExternalUrl).toHaveBeenCalledWith('https://example.com')
			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents['navigate'][0][0]).toBe('https://example.com')
		})

		it('должен открывать и закрывать вложенную группу в dropdown при клике', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			await fireEvent.click(screen.getByText('Каталог'))
			await nextTick()

			expect(container.querySelector('.base-mega-menu__sub-list')).not.toBeInTheDocument()

			const groupHeader = screen.getByText('Кованые изделия')
			await fireEvent.click(groupHeader)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__sub-list')).toBeInTheDocument()

			await fireEvent.click(groupHeader)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__sub-list')).not.toBeInTheDocument()
		})

		it('не должен открывать вложенную группу, если она отключена', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			await fireEvent.click(screen.getByText('Каталог'))
			await nextTick()

			const groupHeader = screen.getByText('Отключенный дочерний')
			await fireEvent.click(groupHeader)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__sub-list')).not.toBeInTheDocument()
		})

		it('должен переходить по ссылке при клике на вложенную группу без детей', async () => {
			const { emitted } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			await fireEvent.click(screen.getByText('Каталог'))
			await nextTick()

			const groupHeader = screen.getByText('Лестницы')
			await fireEvent.click(groupHeader)
			await nextTick()

			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents['navigate'][0][0]).toBe('/stairs')
		})

		it('должен обрабатывать клик по подпункту в dropdown', async () => {
			const { emitted } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			await fireEvent.click(screen.getByText('Каталог'))
			await nextTick()
			await fireEvent.click(screen.getByText('Кованые изделия'))
			await nextTick()

			const subItem = screen.getByText('Ворота')
			await fireEvent.click(subItem)
			await nextTick()

			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents['navigate'][0][0]).toBe('/gates')
		})

		it('не должен обрабатывать клик по отключенному подпункту в dropdown', async () => {
			const { emitted } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			await fireEvent.click(screen.getByText('Каталог'))
			await nextTick()
			await fireEvent.click(screen.getByText('Кованые изделия'))
			await nextTick()

			const subItem = screen.getByText('Отключенный суб-дроп')
			await fireEvent.click(subItem)
			await nextTick()

			const emittedEvents = emitted() as Record<string, any[][]>
			expect(emittedEvents).not.toHaveProperty('navigate')
		})

		it('подузел с target="_self" — ссылка в той же вкладке, переход выполняет браузер', async () => {
			render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			await fireEvent.click(screen.getByText('Каталог'))
			await nextTick()
			await fireEvent.click(screen.getByText('Кованые изделия'))
			await nextTick()

			const link = screen.getByRole('link', { name: 'Ограды' })
			expect(link).toHaveAttribute('href', 'https://example.com/fences')
			expect(link).toHaveAttribute('target', '_self')
			expect(locationHref).toBe('')
		})
	})

	describe('Dropdown Layout - Hover Trigger', () => {
		beforeEach(() => vi.useFakeTimers())
		afterEach(() => vi.useRealTimers())

		it('должен открывать dropdown при наведении на пункт навигации и закрывать при уходе', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'hover', hoverDelay: 200 },
			})

			const navItem = container.querySelector('.base-mega-menu__nav-item')
			expect(navItem).toBeInTheDocument()

			await fireEvent.mouseEnter(navItem!)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__dropdown')).toBeInTheDocument()

			await fireEvent.mouseLeave(navItem!)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__dropdown')).toBeInTheDocument()

			vi.advanceTimersByTime(200)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__dropdown')).not.toBeInTheDocument()
		})

		it('должен открывать вложенную группу при наведении и закрывать при уходе', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'hover', hoverDelay: 200 },
			})

			const navItem = container.querySelector('.base-mega-menu__nav-item')
			await fireEvent.mouseEnter(navItem!)
			await nextTick()

			const groupElement = container.querySelector('.base-mega-menu__dropdown .base-mega-menu__node')
			expect(groupElement).toBeInTheDocument()

			await fireEvent.mouseEnter(groupElement!)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__sub-list')).toBeInTheDocument()

			await fireEvent.mouseLeave(groupElement!)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__sub-list')).toBeInTheDocument()

			vi.advanceTimersByTime(200)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__sub-list')).not.toBeInTheDocument()
		})
	})
	describe('клавиатура и семантика', () => {
		it('заголовок узла — кнопка: Enter раскрывает вложенный уровень, aria-expanded отражает состояние', async () => {
			render(BaseMegaMenu, { props: { columns: COLUMNS, trigger: 'click' } })

			const stairs = screen.getByRole('button', { name: 'Лестницы' })
			expect(stairs).toHaveAttribute('tabindex', '0')
			expect(stairs).toHaveAttribute('aria-expanded', 'false')

			await fireEvent.keyDown(stairs, { key: 'Enter' })
			expect(stairs).toHaveAttribute('aria-expanded', 'true')
			expect(screen.getByRole('link', { name: 'Винтовые' })).toBeInTheDocument()

			await fireEvent.keyDown(stairs, { key: ' ' })
			expect(stairs).toHaveAttribute('aria-expanded', 'false')
		})

		it('лист с адресом — ссылка в порядке Tab: клик (и Enter браузера) эмитит item-click и navigate', async () => {
			const { emitted } = render(BaseMegaMenu, { props: { columns: COLUMNS, trigger: 'click' } })

			const gates = screen.getByRole('link', { name: 'Ворота и ограды' })
			expect(gates).toHaveAttribute('href', '/gates')
			expect(gates).not.toHaveAttribute('aria-expanded')

			gates.addEventListener('click', event => event.preventDefault())
			await fireEvent.click(gates)
			expect(emitted().navigate).toEqual([['/gates']])
			expect(emitted()['item-click']).toHaveLength(1)
		})

		it('лист без адреса — кнопка: клик эмитит только item-click', async () => {
			const { emitted } = render(BaseMegaMenu, { props: { columns: COLUMNS, trigger: 'click' } })

			await fireEvent.click(screen.getByRole('button', { name: 'Кованые изделия' }))
			expect(emitted()['item-click']).toHaveLength(1)
			expect(emitted().navigate).toBeUndefined()
		})

		it('отключённый узел помечен aria-disabled, выведен из порядка Tab и не реагирует на Enter', async () => {
			const { emitted } = render(BaseMegaMenu, { props: { columns: COLUMNS, trigger: 'click' } })

			const disabled = screen.getByRole('link', { name: 'Отключенный элемент' })
			expect(disabled).toHaveAttribute('aria-disabled', 'true')
			expect(disabled).not.toHaveAttribute('href')

			await fireEvent.click(disabled)
			expect(emitted().navigate).toBeUndefined()
		})

		it('пункт навигации с подменю сообщает aria-expanded, пункт-ссылка — нет', async () => {
			render(BaseMegaMenu, { props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' } })

			const catalog = screen.getByRole('button', { name: 'Каталог' })
			expect(catalog).toHaveAttribute('aria-expanded', 'false')
			expect(screen.getByRole('button', { name: 'Контакты' })).not.toHaveAttribute('aria-expanded')

			await fireEvent.click(catalog)
			expect(catalog).toHaveAttribute('aria-expanded', 'true')
		})
	})
})
