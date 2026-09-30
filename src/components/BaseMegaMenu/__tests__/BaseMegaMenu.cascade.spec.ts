import '@testing-library/jest-dom/vitest'
import BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import { defineComponent, h, markRaw, nextTick } from 'vue'
import type { MegaMenuItem } from '../types/BaseMegaMenu.types'
import { resolvePlacement } from '../model/cascade/cascadeItems'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/vue'

const ITEMS: MegaMenuItem[] = [
	{
		key: 'catalog',
		label: 'Каталог',
		groups: [
			{
				title: 'Товары',
				items: [
					{
						label: 'Электроника',
						icon: 'star',
						description: 'Техника',
						children: [
							{
								label: 'Телефоны',
								children: [
									{ label: 'Смартфоны', to: '/phones/smart' },
									{ label: 'Кнопочные', to: '/phones/push' },
								],
							},
							{ label: 'Ноутбуки', to: '/laptops', badge: 'Новое' },
							{ label: 'Планшеты', children: [{ label: 'iPad', to: '/tablets/ipad' }] },
							{ label: 'Архив', to: '/archive', isDisabled: true },
						],
					},
					{ label: 'Одежда', to: '/clothes' },
					{ label: 'Мебель', isDisabled: true, children: [{ label: 'Столы', to: '/tables' }] },
				],
			},
			{ title: 'Сервис', items: [{ label: 'Доставка', to: '/delivery' }] },
		],
	},
	{ label: 'Цены', to: '/pricing' },
]

const button = (name: string | RegExp): HTMLElement => screen.getByRole('button', { name })
const link = (name: string | RegExp): HTMLElement => screen.getByRole('link', { name })
const row = (element: HTMLElement): HTMLElement => element.closest('li')!
const list = (name: string): HTMLElement => screen.getByRole('list', { name })

function mockRects(initial: Record<string, number>): Record<string, number> {
	const rights = { ...initial }
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		return { right: rights[this.getAttribute('aria-label') ?? ''] ?? 0 } as DOMRect
	})
	return rights
}

function setViewport(width: number): void {
	Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
	window.dispatchEvent(new Event('resize'))
}

function hover(element: HTMLElement, pointerType = 'mouse'): Promise<void> {
	return fireEvent.pointerEnter(row(element), { pointerType })
}

function renderMenu(props: Record<string, unknown> = {}) {
	return render(BaseMegaMenu, { props: { items: ITEMS, openKey: 'catalog', trigger: 'click', ...props } })
}

function renderPlain(items: MegaMenuItem[], props: Record<string, unknown> = {}) {
	const Host = defineComponent({ setup: () => () => h(BaseMegaMenu, { items, openKey: 'catalog', trigger: 'click', ...props }) })
	return render(Host)
}

beforeEach(() => setViewport(1280))

afterEach(() => {
	cleanup()
	vi.restoreAllMocks()
	vi.useRealTimers()
})

describe('BaseMegaMenu: каскад — разметка и клик', () => {
	it('рисует пункт с children кнопкой с aria-haspopup и aria-expanded, без aria-controls у свёрнутого', () => {
		renderMenu()
		const parent = button(/Электроника/)

		expect(parent).toHaveAttribute('aria-haspopup', 'true')
		expect(parent).toHaveAttribute('aria-expanded', 'false')
		expect(parent).not.toHaveAttribute('aria-controls')
		expect(button(/Мебель/)).toBeDisabled()
		expect(link('Одежда')).toHaveAttribute('href', '/clothes')
	})

	it('клик раскрывает уровень с id из aria-controls и именем пункта, повторный — сворачивает', async () => {
		renderMenu()
		const parent = button(/Электроника/)

		await fireEvent.click(parent)
		const level = screen.getByRole('list', { name: 'Электроника' })
		expect(parent).toHaveAttribute('aria-expanded', 'true')
		expect(level).toHaveAttribute('id', parent.getAttribute('aria-controls'))
		expect(parent).toHaveClass('base-mega-menu__link--expanded')

		await fireEvent.click(parent)
		expect(parent).toHaveAttribute('aria-expanded', 'false')
		expect(parent).not.toHaveAttribute('aria-controls')
		expect(screen.queryByRole('list', { name: 'Электроника' })).not.toBeInTheDocument()
	})

	it('открывает уровни любой глубины, сосед того же уровня заменяет открытый, выбор ссылки закрывает панель', async () => {
		const { emitted } = renderMenu()

		await fireEvent.click(button(/Электроника/))
		await fireEvent.click(button('Телефоны'))
		expect(screen.getByRole('list', { name: 'Телефоны' })).toBeInTheDocument()

		await fireEvent.click(button('Планшеты'))
		expect(screen.queryByRole('list', { name: 'Телефоны' })).not.toBeInTheDocument()
		await fireEvent.click(link('iPad'))

		expect((emitted('select') as unknown[][])[0][0]).toMatchObject({ label: 'iPad', to: '/tablets/ipad' })
		expect(emitted('update:openKey')?.at(-1)).toEqual([undefined])
	})

	it('не выбирает отключённую ссылку уровня', async () => {
		const { emitted } = renderMenu()

		await fireEvent.click(button(/Электроника/))
		await fireEvent.click(screen.getByText('Архив'))

		expect(emitted('select')).toBeUndefined()
	})

	it('передаёт в слот link уровень ссылки', async () => {
		render(BaseMegaMenu, {
			props: { items: ITEMS, openKey: 'catalog', trigger: 'click' },
			slots: { link: '<template #link="{ link, depth }">{{ link.label }}:{{ depth }}</template>' },
		})

		await fireEvent.click(button('Электроника:0'))

		expect(button('Телефоны:1')).toBeInTheDocument()
		expect(link('Ноутбуки:1')).toHaveAttribute('href', '/laptops')
	})
})

describe('BaseMegaMenu: каскад — клавиатура', () => {
	it('стрелка вправо открывает уровень и ставит фокус на первый пункт, вверх и вниз ходят по уровню', async () => {
		renderMenu()
		button(/Электроника/).focus()

		await fireEvent.keyDown(button(/Электроника/), { key: 'ArrowRight' })
		await waitFor(() => expect(button('Телефоны')).toHaveFocus())

		await fireEvent.keyDown(button('Телефоны'), { key: 'ArrowDown' })
		expect(link(/Ноутбуки/)).toHaveFocus()
		await fireEvent.keyDown(link(/Ноутбуки/), { key: 'End' })
		expect(button('Планшеты')).toHaveFocus()
		await fireEvent.keyDown(button('Планшеты'), { key: 'ArrowDown' })
		expect(button('Телефоны')).toHaveFocus()
		await fireEvent.keyDown(button('Телефоны'), { key: 'ArrowUp' })
		expect(button('Планшеты')).toHaveFocus()
		await fireEvent.keyDown(button('Планшеты'), { key: 'Home' })
		expect(button('Телефоны')).toHaveFocus()
	})

	it('вправо на вложенном пункте открывает следующий уровень, влево закрывает его и возвращает фокус', async () => {
		renderMenu()
		await fireEvent.click(button(/Электроника/))

		await fireEvent.keyDown(button('Телефоны'), { key: 'ArrowRight' })
		await waitFor(() => expect(link('Смартфоны')).toHaveFocus())
		await fireEvent.keyDown(link('Смартфоны'), { key: 'ArrowRight' })
		expect(link('Смартфоны')).toHaveFocus()

		await fireEvent.keyDown(link('Смартфоны'), { key: 'ArrowLeft' })
		expect(button('Телефоны')).toHaveFocus()
		expect(button('Телефоны')).toHaveAttribute('aria-expanded', 'false')
		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'true')
	})

	it('Escape во вложенном уровне закрывает только его, фокус — на пункт, панель остаётся открытой', async () => {
		const { emitted } = renderMenu()
		await fireEvent.click(button(/Электроника/))

		await fireEvent.keyDown(button('Телефоны'), { key: 'Escape' })

		expect(button(/Электроника/)).toHaveFocus()
		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'false')
		expect(emitted('update:openKey')).toBeUndefined()
	})

	it('Escape на раскрытом пункте колонки сворачивает его, на свёрнутом — закрывает панель', async () => {
		const { emitted } = renderMenu()
		await fireEvent.click(button(/Электроника/))
		button(/Электроника/).focus()

		await fireEvent.keyDown(button(/Электроника/), { key: 'Escape' })
		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'false')
		expect(emitted('update:openKey')).toBeUndefined()

		await fireEvent.keyDown(button(/Электроника/), { key: 'Escape' })
		expect(emitted('update:openKey')?.at(-1)).toEqual([undefined])
	})

	it('в колонке стрелки ходят мимо пунктов открытого уровня, влево и вправо — по колонкам', async () => {
		renderMenu()
		await fireEvent.click(button(/Электроника/))
		button(/Электроника/).focus()

		await fireEvent.keyDown(button(/Электроника/), { key: 'ArrowDown' })
		expect(link('Одежда')).toHaveFocus()
		await fireEvent.keyDown(link('Одежда'), { key: 'ArrowRight' })
		expect(link('Доставка')).toHaveFocus()
		await fireEvent.keyDown(link('Доставка'), { key: 'ArrowLeft' })
		expect(button(/Электроника/)).toHaveFocus()
		await fireEvent.keyDown(button(/Электроника/), { key: 'ArrowLeft' })
		expect(link('Доставка')).toHaveFocus()
	})
})

describe('BaseMegaMenu: каскад — наведение', () => {
	it('открывает уровень через openDelay, соседний пункт с уровнем — сразу, пункт без уровня закрывает через closeDelay', async () => {
		vi.useFakeTimers()
		renderMenu({ trigger: 'hover', openDelay: 100, closeDelay: 200 })

		await hover(button(/Электроника/))
		await vi.advanceTimersByTimeAsync(50)
		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'false')
		await vi.advanceTimersByTimeAsync(60)
		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'true')

		await hover(button('Телефоны'))
		await vi.advanceTimersByTimeAsync(100)
		await hover(button('Планшеты'))
		expect(screen.getByRole('list', { name: 'Планшеты' })).toBeInTheDocument()

		await hover(link(/Ноутбуки/))
		await vi.advanceTimersByTimeAsync(150)
		await hover(button('Планшеты'))
		await vi.advanceTimersByTimeAsync(300)
		expect(button('Планшеты')).toHaveAttribute('aria-expanded', 'true')

		await hover(link(/Ноутбуки/))
		await vi.advanceTimersByTimeAsync(200)
		expect(screen.queryByRole('list', { name: 'Планшеты' })).not.toBeInTheDocument()
	})

	it('пункт без уровня при закрытых уровнях и отключённый пункт ничего не открывают', async () => {
		vi.useFakeTimers()
		renderMenu({ trigger: 'hover', openDelay: 100, closeDelay: 200 })

		await hover(link('Одежда'))
		await hover(button(/Мебель/))
		await vi.advanceTimersByTimeAsync(300)

		expect(button(/Мебель/)).toHaveAttribute('aria-expanded', 'false')
		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'false')
	})

	it('не реагирует на касание и на наведение при trigger="click"', async () => {
		vi.useFakeTimers()
		renderMenu({ trigger: 'hover', openDelay: 100 })
		await hover(button(/Электроника/), 'touch')
		await vi.advanceTimersByTimeAsync(200)
		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'false')
		cleanup()

		renderMenu({ trigger: 'click', openDelay: 100 })
		await hover(button(/Электроника/))
		await vi.advanceTimersByTimeAsync(200)
		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'false')
	})
})

describe('BaseMegaMenu: каскад — край экрана и мобильный вид', () => {
	it('открывает уровень под строкой пункта, если он не помещается справа; следующий уровень решает сам', async () => {
		renderMenu()
		const rects = mockRects({ Электроника: 1400, Телефоны: 900 })

		await fireEvent.click(button(/Электроника/))
		await waitFor(() => expect(list('Электроника')).toHaveClass('base-mega-menu__sub--below'))
		await fireEvent.click(button('Телефоны'))
		await waitFor(() => expect(list('Телефоны')).toBeInTheDocument())
		expect(list('Телефоны')).not.toHaveClass('base-mega-menu__sub--below')

		rects.Телефоны = 1300
		await fireEvent.click(button('Планшеты'))
		await fireEvent.click(button('Телефоны'))
		await waitFor(() => expect(list('Телефоны')).toHaveClass('base-mega-menu__sub--below'))
		expect(document.querySelector('.base-mega-menu__sub--flip')).toBeNull()
	})

	it('после закрытия и повторного открытия меряет уровень заново', async () => {
		renderMenu()
		const rects = mockRects({ Электроника: 1400 })

		await fireEvent.click(button(/Электроника/))
		await waitFor(() => expect(list('Электроника')).toHaveClass('base-mega-menu__sub--below'))
		await fireEvent.click(button(/Электроника/))
		rects.Электроника = 900
		await fireEvent.click(button(/Электроника/))
		await waitFor(() => expect(list('Электроника')).toBeInTheDocument())
		expect(list('Электроника')).not.toHaveClass('base-mega-menu__sub--below')
	})

	it('не меряет уровень, закрытый до замера', async () => {
		renderMenu()
		mockRects({ Электроника: 1400 })
		const measure = vi.mocked(HTMLElement.prototype.getBoundingClientRect)

		void fireEvent.click(button(/Электроника/))
		await fireEvent.click(button(/Электроника/))
		await nextTick()

		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'false')
		expect(measure).not.toHaveBeenCalled()
	})

	it('при изменении размера окна пересчитывает открытые уровни от мелких к глубоким', async () => {
		renderMenu()
		const rects = mockRects({ Электроника: 900, Телефоны: 1100 })
		await fireEvent.click(button(/Электроника/))
		await fireEvent.click(button('Телефоны'))
		await waitFor(() => expect(list('Телефоны')).toBeInTheDocument())
		expect(list('Электроника')).not.toHaveClass('base-mega-menu__sub--below')
		expect(list('Телефоны')).not.toHaveClass('base-mega-menu__sub--below')

		rects.Электроника = 1300
		setViewport(1000)
		await waitFor(() => expect(list('Телефоны')).toHaveClass('base-mega-menu__sub--below'))
		expect(list('Электроника')).toHaveClass('base-mega-menu__sub--below')

		setViewport(1280)
		await waitFor(() => expect(list('Телефоны')).not.toHaveClass('base-mega-menu__sub--below'))
		expect(list('Электроника')).toHaveClass('base-mega-menu__sub--below')
	})

	it('на уровне под строкой → открывает следующий уровень с фокусом, ← и Escape возвращают фокус на родителя', async () => {
		renderMenu()
		mockRects({ Электроника: 1400, Телефоны: 1400 })
		await fireEvent.click(button(/Электроника/))
		await waitFor(() => expect(list('Электроника')).toHaveClass('base-mega-menu__sub--below'))

		await fireEvent.keyDown(button('Телефоны'), { key: 'ArrowRight' })
		await waitFor(() => expect(link('Смартфоны')).toHaveFocus())
		await waitFor(() => expect(list('Телефоны')).toHaveClass('base-mega-menu__sub--below'))
		await fireEvent.keyDown(link('Смартфоны'), { key: 'ArrowLeft' })
		expect(button('Телефоны')).toHaveFocus()
		await fireEvent.keyDown(button('Телефоны'), { key: 'Escape' })
		expect(button(/Электроника/)).toHaveFocus()
	})

	it('выбирает место уровня по зазору до правого края окна', () => {
		expect(resolvePlacement({ right: 1272 }, 1280)).toBe('side')
		expect(resolvePlacement({ right: 1273 }, 1280)).toBe('below')
		expect(resolvePlacement({ right: 900 }, 1280)).toBe('side')
	})

	it('в мобильном виде уровень не меряется и не открывается под строкой', async () => {
		setViewport(500)
		mockRects({ Электроника: 1400 })
		renderMenu()
		await fireEvent.click(button('Меню'))
		await fireEvent.click(button(/Электроника/))
		await waitFor(() => expect(list('Электроника')).toBeInTheDocument())
		await nextTick()
		expect(list('Электроника')).not.toHaveClass('base-mega-menu__sub--below')
	})

	it('в мобильном виде раскрывает уровни списком под пунктом кликом, наведение не открывает', async () => {
		vi.useFakeTimers()
		setViewport(500)
		render(BaseMegaMenu, { props: { items: ITEMS, openKey: 'catalog', openDelay: 50 } })

		expect(screen.getByRole('navigation')).toHaveClass('base-mega-menu--mobile')
		await fireEvent.click(button('Меню'))
		await hover(button(/Электроника/))
		await vi.advanceTimersByTimeAsync(100)
		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'false')

		await fireEvent.click(button(/Электроника/))
		expect(screen.getByRole('list', { name: 'Электроника' }).closest('.base-mega-menu__panel--inline')).not.toBeNull()
	})
})

describe('BaseMegaMenu: каскад — обычный, не reactive массив items', () => {
	it.each([
		['обычный массив', (): MegaMenuItem[] => structuredClone(ITEMS)],
		['markRaw', (): MegaMenuItem[] => markRaw(structuredClone(ITEMS))],
	])('%s: на рабочем столе раскрывает уровни кликом и стрелкой вправо', async (_, create) => {
		renderPlain(create())

		await fireEvent.click(button(/Электроника/))
		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'true')
		expect(button(/Электроника/)).toHaveAttribute('aria-controls', screen.getByRole('list', { name: 'Электроника' }).id)

		await fireEvent.click(button('Телефоны'))
		expect(button('Телефоны')).toHaveAttribute('aria-expanded', 'true')
		expect(link('Смартфоны')).toBeInTheDocument()

		await fireEvent.keyDown(button('Планшеты'), { key: 'ArrowRight' })
		expect(button('Планшеты')).toHaveAttribute('aria-expanded', 'true')
		expect(button('Телефоны')).toHaveAttribute('aria-expanded', 'false')
		await waitFor(() => expect(link('iPad')).toHaveFocus())
	})

	it('на рабочем столе раскрывает уровень наведением', async () => {
		vi.useFakeTimers()
		renderPlain(structuredClone(ITEMS), { trigger: 'hover', openDelay: 50 })

		await hover(button(/Электроника/))
		await vi.advanceTimersByTimeAsync(100)
		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'true')
	})

	it('в мобильном виде раскрывает второй уровень кликом и стрелкой вправо', async () => {
		setViewport(500)
		renderPlain(structuredClone(ITEMS), { trigger: undefined })

		expect(screen.getByRole('navigation')).toHaveClass('base-mega-menu--mobile')
		await fireEvent.click(button('Меню'))
		await fireEvent.click(button(/Электроника/))
		expect(button(/Электроника/)).toHaveAttribute('aria-expanded', 'true')

		await fireEvent.click(button('Телефоны'))
		expect(button('Телефоны')).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByRole('list', { name: 'Телефоны' }).closest('.base-mega-menu__panel--inline')).not.toBeNull()

		await fireEvent.keyDown(button('Планшеты'), { key: 'ArrowRight' })
		expect(button('Планшеты')).toHaveAttribute('aria-expanded', 'true')
		expect(button('Телефоны')).toHaveAttribute('aria-expanded', 'false')
		await waitFor(() => expect(link('iPad')).toHaveFocus())
	})
})
