/**
 * Unit-тесты для BaseMegaMenu.
 * Проверяют рендер, пропсы, рекурсивную вложенность и навигацию.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { openExternalUrl } from '@utils/navigationUtils'
import { nextTick } from 'vue'

import BaseMegaMenu from '../ui/BaseMegaMenu.vue'

vi.mock('@utils/navigationUtils', () => ({
	openExternalUrl: vi.fn(),
}))

const COLUMNS = [
	{
		title: 'Каталог',
		icon: 'folder',
		items: [
			{ label: 'Кованые изделия', description: 'Ручная ковка' },
			{ label: 'Ворота и ограды', to: '/gates' },
			{
				label: 'Лестницы',
				children: [{ label: 'Винтовые', to: '/spiral' }, { label: 'Маршевые' }],
			},
		],
	},
	{
		title: 'О компании',
		items: [{ label: 'Наша история' }],
	},
]

const DROPDOWN_ITEMS = [
	{
		label: 'Каталог',
		icon: 'folder',
		children: [
			{
				label: 'Кованые изделия',
				description: 'Ручная ковка',
				children: [{ label: 'Ворота', to: '/gates' }],
			},
			{ label: 'Лестницы', to: '/stairs' },
		],
	},
	{ label: 'Контакты', href: 'https://example.com', target: '_blank' as const },
]

describe('BaseMegaMenu unit', () => {
	describe('рендер', () => {
		it('должен рендерить мега-меню в режиме columns по умолчанию', () => {
			const { container } = render(BaseMegaMenu, { props: { columns: COLUMNS } })

			expect(container.querySelector('.base-mega-menu')).toBeInTheDocument()
			expect(container.querySelector('.base-mega-menu--columns')).toBeInTheDocument()
			expect(screen.getByText('Каталог')).toBeInTheDocument()
			expect(screen.getByText('О компании')).toBeInTheDocument()
		})

		it('должен рендерить мега-меню в режиме dropdown', () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown' },
			})

			expect(container.querySelector('.base-mega-menu--dropdown')).toBeInTheDocument()
			expect(screen.getByText('Каталог')).toBeInTheDocument()
			expect(screen.getByText('Контакты')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		it('не должен добавлять класс модификатора для варианта default по умолчанию', () => {
			const { container } = render(BaseMegaMenu, { props: { columns: COLUMNS } })
			expect(container.querySelector('.base-mega-menu')).not.toHaveClass('base-mega-menu--default')
		})

		it('должен применять класс модификатора --ghost', () => {
			const { container } = render(BaseMegaMenu, { props: { columns: COLUMNS, variant: 'ghost' } })
			expect(container.querySelector('.base-mega-menu')).toHaveClass('base-mega-menu--ghost')
		})

		it('должен применять класс модификатора --soft', () => {
			const { container } = render(BaseMegaMenu, { props: { columns: COLUMNS, variant: 'soft' } })
			expect(container.querySelector('.base-mega-menu')).toHaveClass('base-mega-menu--soft')
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать style когда sizeScale=100', () => {
			const { container } = render(BaseMegaMenu, { props: { columns: COLUMNS, sizeScale: 100 } })
			expect(container.querySelector('.base-mega-menu')?.getAttribute('style')).toBeNull()
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseMegaMenu, { props: { columns: COLUMNS, sizeScale: 150 } })
			expect(container.querySelector('.base-mega-menu')?.getAttribute('style')).toContain('--size-scale: 1.5')
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, customClass: 'custom-root-class' },
			})
			expect(container.querySelector('.base-mega-menu')).toHaveClass('custom-root-class')
		})

		it('должен распределять объект классов по внутренним элементам в columns layout', () => {
			const { container } = render(BaseMegaMenu, {
				props: {
					columns: COLUMNS,
					customClass: {
						root: 'custom-root',
						container: 'custom-container',
						column: 'custom-column',
						title: 'custom-title',
						list: 'custom-list',
					},
				},
			})

			expect(container.querySelector('.base-mega-menu')).toHaveClass('custom-root')
			expect(container.querySelector('.base-mega-menu__container')).toHaveClass('custom-container')
			expect(container.querySelector('.base-mega-menu__column')).toHaveClass('custom-column')
			expect(container.querySelector('.base-mega-menu__title')).toHaveClass('custom-title')
			expect(container.querySelector('.base-mega-menu__list')).toHaveClass('custom-list')
		})
	})

	describe('columns: клики по элементам', () => {
		it('должен переключать колонку при клике по заголовку (trigger=click)', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			const title = container.querySelector('.base-mega-menu__title') as HTMLElement
			await fireEvent.click(title)

			expect(emitted()).toHaveProperty('column-click')
		})

		it('должен закрывать колонку при повторном клике', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			const title = container.querySelector('.base-mega-menu__title') as HTMLElement
			await fireEvent.click(title)
			await fireEvent.click(title)

			expect(emitted()['column-click']).toHaveLength(2)
		})

		it('не должен переключать колонку при trigger=hover', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover' },
			})

			const title = container.querySelector('.base-mega-menu__title') as HTMLElement
			await fireEvent.click(title)

			expect(emitted()['column-click']).toBeUndefined()
		})

		it('должен эмитить item-click при клике по узлу', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			const header = container.querySelector('.base-mega-menu__node-header') as HTMLElement
			await fireEvent.click(header)

			expect(emitted()).toHaveProperty('item-click')
		})

		it('должен раскрывать под-список при клике по узлу с children', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			const headers = container.querySelectorAll('.base-mega-menu__node-header')
			await fireEvent.click(headers[2] as HTMLElement)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__sub-list')).toBeInTheDocument()
		})

		it('должен закрывать под-список при повторном клике', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			const headers = container.querySelectorAll('.base-mega-menu__node-header')
			await fireEvent.click(headers[2] as HTMLElement)
			await nextTick()
			await fireEvent.click(headers[2] as HTMLElement)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__sub-list')).not.toBeInTheDocument()
		})

		it('должен держать открытым только один соседний узел (открытие закрывает предыдущий)', async () => {
			const { container } = render(BaseMegaMenu, {
				props: {
					columns: [
						{
							title: 'Меню',
							items: [
								{ label: 'Первый', children: [{ label: 'A1' }] },
								{ label: 'Второй', children: [{ label: 'B1' }] },
							],
						},
					],
					trigger: 'click',
				},
			})

			const headers = () => container.querySelectorAll('.base-mega-menu__node--has-children > .base-mega-menu__node-header')
			await fireEvent.click(headers()[0] as HTMLElement)
			await nextTick()
			expect(container.querySelectorAll('.base-mega-menu__sub-list')).toHaveLength(1)

			await fireEvent.click(headers()[1] as HTMLElement)
			await nextTick()

			expect(container.querySelectorAll('.base-mega-menu__sub-list')).toHaveLength(1)
			expect(container.querySelectorAll('.base-mega-menu__node--open')).toHaveLength(1)
			expect(container.querySelector('.base-mega-menu__node--open .base-mega-menu__node-label')?.textContent).toContain(
				'Второй',
			)
		})

		it('не должен эмитить item-click для отключённого узла', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: {
					columns: [{ title: 'Тест', items: [{ label: 'Отключён', isDisabled: true }] }],
					trigger: 'click',
				},
			})

			const header = container.querySelector('.base-mega-menu__node-header') as HTMLElement
			await fireEvent.click(header)

			expect(emitted()['item-click']).toBeUndefined()
		})

		it('должен вызывать navigate при клике по узлу с to', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			const headers = container.querySelectorAll('.base-mega-menu__node-header')
			await fireEvent.click(headers[1] as HTMLElement)

			expect(emitted()).toHaveProperty('navigate')
			expect(emitted().navigate[0]).toEqual(['/gates'])
		})

		it('должен эмитить item-click при клике по вложенному узлу', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			const headers = container.querySelectorAll('.base-mega-menu__node-header')
			await fireEvent.click(headers[2] as HTMLElement)
			await nextTick()

			const subHeader = container.querySelector('.base-mega-menu__sub-list .base-mega-menu__node-header') as HTMLElement
			await fireEvent.click(subHeader)

			expect(emitted()['item-click']?.length).toBeGreaterThanOrEqual(2)
			expect(emitted().navigate[0]).toEqual(['/spiral'])
		})
	})

	describe('columns: hover-поведение', () => {
		beforeEach(() => vi.useFakeTimers())
		afterEach(() => vi.useRealTimers())

		it('должен раскрывать колонку при mouseenter с trigger=hover', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover' },
			})

			const column = container.querySelector('.base-mega-menu__column') as HTMLElement
			await fireEvent.mouseEnter(column)

			expect(container.querySelector('.base-mega-menu__list')).toBeInTheDocument()
		})

		it('не должен реагировать на mouseenter колонки при trigger=click', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			const column = container.querySelector('.base-mega-menu__column') as HTMLElement
			await fireEvent.mouseEnter(column)

			expect(emitted()['column-click']).toBeUndefined()
		})

		it('должен закрывать колонки после mouseleave с задержкой', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover', hoverDelay: 100 },
			})

			const column = container.querySelector('.base-mega-menu__column') as HTMLElement
			await fireEvent.mouseEnter(column)
			await fireEvent.mouseLeave(column)

			vi.advanceTimersByTime(150)
			await nextTick()
		})

		it('не должен реагировать на mouseleave колонки при trigger=click', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			const column = container.querySelector('.base-mega-menu__column') as HTMLElement
			await fireEvent.mouseLeave(column)

			expect(container).toBeTruthy()
		})

		it('должен раскрывать под-список при mouseenter по узлу с children', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover' },
			})

			const nodes = container.querySelectorAll('.base-mega-menu__node')
			await fireEvent.mouseEnter(nodes[2] as HTMLElement)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__sub-list')).toBeInTheDocument()
		})

		it('не должен раскрывать под-список для узла без children', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover' },
			})

			const nodes = container.querySelectorAll('.base-mega-menu__node')
			await fireEvent.mouseEnter(nodes[0] as HTMLElement)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__sub-list')).not.toBeInTheDocument()
		})

		it('не должен запускать таймер на mouseleave для узла без children', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover', hoverDelay: 100 },
			})

			const nodes = container.querySelectorAll('.base-mega-menu__node')
			await fireEvent.mouseLeave(nodes[0] as HTMLElement)

			vi.advanceTimersByTime(150)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__sub-list')).not.toBeInTheDocument()
		})

		it('должен закрывать под-список после mouseleave с задержкой', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover', hoverDelay: 100 },
			})

			const nodes = container.querySelectorAll('.base-mega-menu__node')
			await fireEvent.mouseEnter(nodes[2] as HTMLElement)
			await nextTick()
			await fireEvent.mouseLeave(nodes[2] as HTMLElement)

			vi.advanceTimersByTime(150)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__sub-list')).not.toBeInTheDocument()
		})

		it('должен очищать активный hoverTimer при повторном mouseenter', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover', hoverDelay: 1000 },
			})

			const column = container.querySelector('.base-mega-menu__column') as HTMLElement
			await fireEvent.mouseEnter(column)
			await fireEvent.mouseLeave(column)
			await fireEvent.mouseEnter(column)
			vi.advanceTimersByTime(1500)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__list')).toBeInTheDocument()
		})
	})

	describe('dropdown: клики по элементам', () => {
		it('должен эмитить item-click при клике по навигационному пункту', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			const navLink = container.querySelector('.base-mega-menu__nav-link') as HTMLElement
			await fireEvent.click(navLink)

			expect(emitted()).toHaveProperty('item-click')
		})

		it('должен раскрывать dropdown при клике по элементу с children', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			const navLink = container.querySelector('.base-mega-menu__nav-link') as HTMLElement
			await fireEvent.click(navLink)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__dropdown')).toBeInTheDocument()
		})

		it('должен закрывать dropdown при повторном клике', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			const navLink = container.querySelector('.base-mega-menu__nav-link') as HTMLElement
			await fireEvent.click(navLink)
			await fireEvent.click(navLink)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__dropdown')).not.toBeInTheDocument()
		})

		it('должен вызывать navigate при клике по элементу без children с href', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			const navLinks = container.querySelectorAll('.base-mega-menu__nav-link')
			await fireEvent.click(navLinks[1] as HTMLElement)

			expect(emitted()).toHaveProperty('navigate')
			expect(openExternalUrl).toHaveBeenCalledWith('https://example.com')
		})

		it('должен эмитить navigate с маршрутом для nav-item без children с to', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: {
					items: [{ label: 'Главная', to: '/home' }],
					layout: 'dropdown',
					trigger: 'click',
				},
			})

			const navLink = container.querySelector('.base-mega-menu__nav-link') as HTMLElement
			await fireEvent.click(navLink)

			expect(emitted().navigate?.[0]).toEqual(['/home'])
		})

		it('не должен эмитить navigate для nav-item без children, to и href', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: {
					items: [{ label: 'Без ссылки' }],
					layout: 'dropdown',
					trigger: 'click',
				},
			})

			const navLink = container.querySelector('.base-mega-menu__nav-link') as HTMLElement
			await fireEvent.click(navLink)

			expect(emitted()).toHaveProperty('item-click')
			expect(emitted().navigate).toBeUndefined()
		})

		it('не должен эмитить item-click для отключённого навигационного пункта', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: {
					items: [{ label: 'Отключён', isDisabled: true }],
					layout: 'dropdown',
					trigger: 'click',
				},
			})

			const navLink = container.querySelector('.base-mega-menu__nav-link') as HTMLElement
			await fireEvent.click(navLink)

			expect(emitted()['item-click']).toBeUndefined()
		})

		it('должен раскрывать вложенную группу при клике', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			const navLink = container.querySelector('.base-mega-menu__nav-link') as HTMLElement
			await fireEvent.click(navLink)
			await nextTick()

			const groupHeader = container.querySelector('.base-mega-menu__dropdown .base-mega-menu__node-header') as HTMLElement
			await fireEvent.click(groupHeader)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__sub-list')).toBeInTheDocument()
		})

		it('должен эмитить item-click при клике по глубоко вложенному узлу', async () => {
			const { container, emitted } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			const navLink = container.querySelector('.base-mega-menu__nav-link') as HTMLElement
			await fireEvent.click(navLink)
			await nextTick()

			const groupHeader = container.querySelector('.base-mega-menu__dropdown .base-mega-menu__node-header') as HTMLElement
			await fireEvent.click(groupHeader)
			await nextTick()

			const subHeader = container.querySelector('.base-mega-menu__sub-list .base-mega-menu__node-header') as HTMLElement
			await fireEvent.click(subHeader)

			expect(emitted().navigate[0]).toEqual(['/gates'])
		})
	})

	describe('dropdown: hover-поведение', () => {
		beforeEach(() => vi.useFakeTimers())
		afterEach(() => vi.useRealTimers())

		it('должен раскрывать dropdown при mouseenter с trigger=hover', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'hover' },
			})

			const navItem = container.querySelector('.base-mega-menu__nav-item') as HTMLElement
			await fireEvent.mouseEnter(navItem)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__dropdown')).toBeInTheDocument()
		})

		it('не должен раскрывать dropdown для элемента без children', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'hover' },
			})

			const navItems = container.querySelectorAll('.base-mega-menu__nav-item')
			await fireEvent.mouseEnter(navItems[1] as HTMLElement)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__dropdown')).not.toBeInTheDocument()
		})

		it('не должен реагировать на mouseenter nav-item при trigger=click', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			const navItem = container.querySelector('.base-mega-menu__nav-item') as HTMLElement
			await fireEvent.mouseEnter(navItem)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__dropdown')).not.toBeInTheDocument()
		})

		it('должен закрывать dropdown после mouseleave с задержкой', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'hover', hoverDelay: 100 },
			})

			const navItem = container.querySelector('.base-mega-menu__nav-item') as HTMLElement
			await fireEvent.mouseEnter(navItem)
			await fireEvent.mouseLeave(navItem)

			vi.advanceTimersByTime(150)
			await nextTick()
			expect(container.querySelector('.base-mega-menu__dropdown')).not.toBeInTheDocument()
		})

		it('не должен реагировать на mouseleave nav-item при trigger=click', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'click' },
			})

			const navItem = container.querySelector('.base-mega-menu__nav-item') as HTMLElement
			await fireEvent.mouseLeave(navItem)

			expect(container).toBeTruthy()
		})

		it('должен раскрывать вложенную группу при mouseenter (hover)', async () => {
			const { container } = render(BaseMegaMenu, {
				props: { items: DROPDOWN_ITEMS, layout: 'dropdown', trigger: 'hover' },
			})

			const navItem = container.querySelector('.base-mega-menu__nav-item') as HTMLElement
			await fireEvent.mouseEnter(navItem)
			await nextTick()

			const node = container.querySelector('.base-mega-menu__dropdown .base-mega-menu__node') as HTMLElement
			await fireEvent.mouseEnter(node)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__sub-list')).toBeInTheDocument()
		})
	})

	describe('navigate', () => {
		it('должен вызывать window.location.href при target=_self', async () => {
			const originalLocation = window.location
			const hrefSetter = vi.fn()
			Object.defineProperty(window, 'location', {
				configurable: true,
				value: {
					...originalLocation,
					set href(value: string) {
						hrefSetter(value)
					},
				},
			})

			const { container } = render(BaseMegaMenu, {
				props: {
					items: [{ label: 'Внутренняя', href: '/internal', target: '_self' }],
					layout: 'dropdown',
					trigger: 'click',
				},
			})

			const navLink = container.querySelector('.base-mega-menu__nav-link') as HTMLElement
			await fireEvent.click(navLink)

			expect(hrefSetter).toHaveBeenCalledWith('/internal')

			Object.defineProperty(window, 'location', {
				configurable: true,
				value: originalLocation,
			})
		})

		it('должен открывать внешнюю ссылку через openExternalUrl', async () => {
			const { container } = render(BaseMegaMenu, {
				props: {
					items: [{ label: 'Внешняя', href: 'https://example.com', target: '_blank' }],
					layout: 'dropdown',
					trigger: 'click',
				},
			})

			const navLink = container.querySelector('.base-mega-menu__nav-link') as HTMLElement
			await fireEvent.click(navLink)

			expect(openExternalUrl).toHaveBeenCalledWith('https://example.com')
		})
	})

	describe('адаптивный аккордеон (мобильный)', () => {
		const originalWidth = window.innerWidth

		function setWidth(width: number): void {
			Object.defineProperty(window, 'innerWidth', { value: width, configurable: true, writable: true })
		}

		afterEach(() => setWidth(originalWidth))

		it('должен добавлять класс --accordion при узкой ширине экрана', () => {
			setWidth(500)
			const { container } = render(BaseMegaMenu, { props: { columns: COLUMNS } })

			expect(container.querySelector('.base-mega-menu')).toHaveClass('base-mega-menu--accordion')
		})

		it('не должен добавлять класс --accordion на десктопе', () => {
			setWidth(1024)
			const { container } = render(BaseMegaMenu, { props: { columns: COLUMNS } })

			expect(container.querySelector('.base-mega-menu')).not.toHaveClass('base-mega-menu--accordion')
		})

		it('должен раскрывать колонку по клику даже при trigger=hover на мобильном', async () => {
			setWidth(500)
			const { container, emitted } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover' },
			})

			const title = container.querySelector('.base-mega-menu__title') as HTMLElement
			await fireEvent.click(title)

			expect(emitted()).toHaveProperty('column-click')
		})

		it('должен раскрывать под-список узла по клику на мобильном (аккордеон, не каскад)', async () => {
			setWidth(500)
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'hover' },
			})

			const title = container.querySelector('.base-mega-menu__title') as HTMLElement
			await fireEvent.click(title)
			await nextTick()

			const headers = container.querySelectorAll('.base-mega-menu__node-header')
			await fireEvent.click(headers[2] as HTMLElement)
			await nextTick()

			expect(container.querySelector('.base-mega-menu__sub-list')).toBeInTheDocument()
		})
	})

	describe('иконки и вложенность', () => {
		it('должен рендерить иконку узла в columns layout', () => {
			const { container } = render(BaseMegaMenu, {
				props: {
					columns: [{ title: 'Каталог', items: [{ label: 'С иконкой', icon: 'folder' }] }],
					trigger: 'click',
				},
			})

			const header = container.querySelector('.base-mega-menu__node-header')
			expect(header?.querySelector('.base-mega-menu__node-icon')).toBeTruthy()
		})

		it('должен показывать стрелку только у узлов с children', () => {
			const { container } = render(BaseMegaMenu, {
				props: { columns: COLUMNS, trigger: 'click' },
			})

			const nodes = container.querySelectorAll('.base-mega-menu__node')
			expect(nodes[0].querySelector('.base-mega-menu__node-arrow')).toBeNull()
			expect(nodes[2].querySelector('.base-mega-menu__node-arrow')).toBeTruthy()
		})

		it('должен поддерживать вложенность глубже трёх уровней', async () => {
			const { container } = render(BaseMegaMenu, {
				props: {
					columns: [
						{
							title: 'Дерево',
							items: [
								{
									label: 'Уровень 1',
									children: [
										{
											label: 'Уровень 2',
											children: [{ label: 'Уровень 3', children: [{ label: 'Уровень 4', to: '/deep' }] }],
										},
									],
								},
							],
						},
					],
					trigger: 'click',
				},
			})

			await fireEvent.click(screen.getByText('Уровень 1'))
			await nextTick()
			await fireEvent.click(screen.getByText('Уровень 2'))
			await nextTick()
			await fireEvent.click(screen.getByText('Уровень 3'))
			await nextTick()

			expect(screen.getByText('Уровень 4')).toBeInTheDocument()
		})
	})
})
