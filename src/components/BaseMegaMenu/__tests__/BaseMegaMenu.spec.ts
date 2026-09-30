import '@testing-library/jest-dom/vitest'
import BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { MegaMenuItem } from '../types/BaseMegaMenu.types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/vue'

const ITEMS: MegaMenuItem[] = [
	{
		key: 'products',
		label: 'Продукты',
		icon: 'folder',
		groups: [
			{
				title: 'Платформа',
				items: [
					{ label: 'Аналитика', icon: 'star', description: 'Отчёты', to: '/analytics', badge: 'Новое' },
					{ label: 'Документы', to: '/docs' },
				],
			},
			{
				title: 'Интеграции',
				items: [
					{ label: 'Почта', to: '/mail' },
					{ label: 'Скоро', to: '/soon', isDisabled: true },
				],
			},
		],
		promo: { title: 'Rise 2.0', description: 'Что нового', image: 'data:image/png;base64,AA', to: '/changelog' },
	},
	{ label: 'Ресурсы', groups: [{ items: [{ label: 'Блог', href: 'https://example.com/blog', target: '_blank' }] }] },
	{ key: 'promo-only', label: 'Акции', promo: { title: 'Скидки', linkLabel: 'Смотреть', href: 'https://example.com/sale' } },
	{ key: 'locked', label: 'Закрыто', isDisabled: true, groups: [{ items: [{ label: 'Тайна', to: '/secret' }] }] },
	{ label: 'Цены', icon: 'star', to: '/pricing' },
]

function setViewport(width: number): void {
	Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
	window.dispatchEvent(new Event('resize'))
}

function pointer(type: 'pointerEnter' | 'pointerLeave', element: Element, pointerType = 'mouse'): Promise<void> {
	return fireEvent[type](element, { pointerType })
}

const trigger = (name: string): HTMLElement => screen.getByRole('button', { name })
const item = (name: string): HTMLElement => trigger(name).closest('li')!

beforeEach(() => setViewport(1280))

afterEach(() => {
	cleanup()
	vi.useRealTimers()
})

describe('BaseMegaMenu: разметка', () => {
	it('рисует ориентир, разделы-кнопки с aria-expanded и разделы-ссылки', () => {
		render(BaseMegaMenu, { props: { items: ITEMS } })

		expect(screen.getByRole('navigation', { name: 'Главное меню' })).toBeInTheDocument()
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'false')
		expect(trigger('Продукты')).toHaveAttribute('aria-controls')
		expect(trigger('Закрыто')).toBeDisabled()
		expect(screen.getByRole('link', { name: 'Цены' })).toHaveAttribute('href', '/pricing')
	})

	it('берёт имя ориентира из ariaLabel и рисует слот end', () => {
		render(BaseMegaMenu, { props: { items: ITEMS, ariaLabel: 'Сайт' }, slots: { end: '<button>Войти</button>' } })

		expect(screen.getByRole('navigation', { name: 'Сайт' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
	})

	it('помечает текущий раздел aria-current: кнопку — true, ссылку — page', () => {
		const items: MegaMenuItem[] = [
			{ label: 'Продукты', isActive: true, groups: [{ items: [{ label: 'Аналитика', to: '/a' }] }] },
			{ label: 'Цены', to: '/pricing', isActive: true },
		]
		render(BaseMegaMenu, { props: { items } })

		expect(trigger('Продукты')).toHaveAttribute('aria-current', 'true')
		expect(screen.getByRole('link', { name: 'Цены' })).toHaveAttribute('aria-current', 'page')
	})

	it('без items рисует пустую строку', () => {
		render(BaseMegaMenu)

		expect(screen.queryAllByRole('listitem')).toHaveLength(0)
	})
})

describe('BaseMegaMenu: панель по клику', () => {
	it('открывает панель: колонки с именами, ссылки, бейдж, промо; повторный клик закрывает', async () => {
		const { emitted } = render(BaseMegaMenu, { props: { items: ITEMS, trigger: 'click' } })

		await fireEvent.click(trigger('Продукты'))
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'true')
		const panel = document.getElementById(trigger('Продукты').getAttribute('aria-controls')!)!
		expect(within(panel).getByRole('list', { name: 'Платформа' })).toBeInTheDocument()
		expect(within(panel).getByRole('link', { name: /Аналитика/ })).toHaveTextContent('Новое')
		expect(within(panel).getByRole('link', { name: /Подробнее/ })).toHaveAttribute('href', '/changelog')
		expect(emitted()['update:openKey']).toEqual([['products']])

		await fireEvent.click(trigger('Продукты'))
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'false')
		expect(emitted()['update:openKey']).toEqual([['products'], [undefined]])
	})

	it('раздел без колонок, но с промо — тоже панель; подпись ссылки промо из linkLabel', async () => {
		render(BaseMegaMenu, { props: { items: ITEMS } })

		await fireEvent.click(trigger('Акции'))
		expect(screen.getByRole('link', { name: /Смотреть/ })).toHaveAttribute('href', 'https://example.com/sale')
	})

	it('выбор ссылки эмитит select и закрывает панель; отключённая ссылка не выбирается', async () => {
		const { emitted } = render(BaseMegaMenu, { props: { items: ITEMS } })

		await fireEvent.click(trigger('Продукты'))
		await fireEvent.click(screen.getByRole('link', { name: /Скоро/ }))
		expect(emitted().select).toBeUndefined()

		await fireEvent.click(screen.getByRole('link', { name: /Почта/ }))
		expect((emitted().select as unknown[][])[0][0]).toMatchObject({ label: 'Почта' })
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'false')
	})

	it('ссылка промо эмитит select с её адресом, раздел-ссылка — сам раздел', async () => {
		const { emitted } = render(BaseMegaMenu, { props: { items: ITEMS } })

		await fireEvent.click(trigger('Продукты'))
		await fireEvent.click(screen.getByRole('link', { name: /Подробнее/ }))
		expect((emitted().select as unknown[][])[0][0]).toEqual({ label: 'Rise 2.0', to: '/changelog', href: undefined })

		await fireEvent.click(screen.getByRole('link', { name: 'Цены' }))
		expect((emitted().select as unknown[][])[1][0]).toMatchObject({ label: 'Цены' })
	})

	it('закрывается кликом вне меню, Escape и уходом фокуса наружу', async () => {
		const outside = document.createElement('button')
		document.body.append(outside)
		render(BaseMegaMenu, { props: { items: ITEMS } })

		await fireEvent.click(trigger('Продукты'))
		await fireEvent.mouseDown(document.body)
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'false')

		await fireEvent.click(trigger('Продукты'))
		await fireEvent.keyDown(document, { key: 'Escape' })
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'false')

		await fireEvent.click(trigger('Продукты'))
		await fireEvent.focusOut(trigger('Продукты'), { relatedTarget: screen.getByRole('link', { name: 'Цены' }) })
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'true')
		await fireEvent.focusOut(trigger('Продукты'), { relatedTarget: null })
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'true')
		await fireEvent.focusOut(trigger('Продукты'), { relatedTarget: outside })
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'false')
		outside.remove()
	})

	it('метод close закрывает панель', async () => {
		const menu = ref<{ close: () => void } | null>(null)
		render(defineComponent({ setup: () => () => h(BaseMegaMenu, { ref: menu, items: ITEMS }) }))

		await fireEvent.click(trigger('Продукты'))
		menu.value!.close()
		await nextTick()
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'false')
	})

	it('слушается openKey (v-model) и показывает только панель раздела с колонками', async () => {
		const { rerender, emitted } = render(BaseMegaMenu, { props: { items: ITEMS, openKey: 'Ресурсы' } })
		expect(trigger('Ресурсы')).toHaveAttribute('aria-expanded', 'true')

		await fireEvent.click(trigger('Продукты'))
		expect(emitted()['update:openKey']).toEqual([['products']])
		expect(trigger('Ресурсы')).toHaveAttribute('aria-expanded', 'true')

		await rerender({ items: ITEMS, openKey: 'Цены' })
		expect(screen.queryByRole('link', { name: /Блог/ })).toBeNull()
	})
})

describe('BaseMegaMenu: наведение', () => {
	it('открывает через openDelay, переключает сразу, закрывает через closeDelay', async () => {
		vi.useFakeTimers()
		render(BaseMegaMenu, { props: { items: ITEMS, openDelay: 100, closeDelay: 200 } })

		await pointer('pointerEnter', item('Продукты'))
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'false')
		await vi.advanceTimersByTimeAsync(100)
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'true')

		await pointer('pointerEnter', item('Ресурсы'))
		expect(trigger('Ресурсы')).toHaveAttribute('aria-expanded', 'true')

		await pointer('pointerLeave', item('Ресурсы'))
		const panel = document.getElementById(trigger('Ресурсы').getAttribute('aria-controls')!)!
		await pointer('pointerEnter', panel)
		await vi.advanceTimersByTimeAsync(300)
		expect(trigger('Ресурсы')).toHaveAttribute('aria-expanded', 'true')

		await pointer('pointerLeave', panel)
		await vi.advanceTimersByTimeAsync(200)
		expect(trigger('Ресурсы')).toHaveAttribute('aria-expanded', 'false')
	})

	it('наведение на раздел-ссылку или отключённый раздел закрывает открытую наведением панель', async () => {
		vi.useFakeTimers()
		render(BaseMegaMenu, { props: { items: ITEMS, openDelay: 0, closeDelay: 50 } })

		await pointer('pointerEnter', item('Продукты'))
		await vi.advanceTimersByTimeAsync(0)
		await pointer('pointerEnter', screen.getByRole('link', { name: 'Цены' }).closest('li')!)
		await vi.advanceTimersByTimeAsync(50)
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'false')

		await pointer('pointerEnter', item('Закрыто'))
		await vi.advanceTimersByTimeAsync(50)
		expect(trigger('Закрыто')).toHaveAttribute('aria-expanded', 'false')
	})

	it('клик закрепляет панель, открытую наведением: уход курсора её не закрывает', async () => {
		vi.useFakeTimers()
		render(BaseMegaMenu, { props: { items: ITEMS, openDelay: 0, closeDelay: 50 } })

		await pointer('pointerEnter', item('Продукты'))
		await vi.advanceTimersByTimeAsync(0)
		await fireEvent.click(trigger('Продукты'))
		await pointer('pointerLeave', item('Продукты'))
		await vi.advanceTimersByTimeAsync(100)
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'true')
	})

	it('не реагирует на касание и при trigger="click"', async () => {
		vi.useFakeTimers()
		const { rerender } = render(BaseMegaMenu, { props: { items: ITEMS, openDelay: 0 } })

		await pointer('pointerEnter', item('Продукты'), 'touch')
		await vi.advanceTimersByTimeAsync(10)
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'false')

		await rerender({ items: ITEMS, openDelay: 0, trigger: 'click' })
		await pointer('pointerEnter', item('Продукты'))
		await pointer('pointerLeave', item('Продукты'))
		const panelless = screen.getByRole('link', { name: 'Цены' }).closest('li')!
		await pointer('pointerEnter', panelless)
		await vi.advanceTimersByTimeAsync(10)
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'false')
	})
})

describe('BaseMegaMenu: клавиатура', () => {
	it('стрелки ходят между разделами по кругу, Home и End — к краям; открытая панель следует за фокусом', async () => {
		render(BaseMegaMenu, { props: { items: ITEMS } })
		const pricing = screen.getByRole('link', { name: 'Цены' })

		trigger('Продукты').focus()
		await fireEvent.keyDown(trigger('Продукты'), { key: 'ArrowRight' })
		expect(trigger('Ресурсы')).toHaveFocus()
		await fireEvent.keyDown(trigger('Ресурсы'), { key: 'End' })
		expect(pricing).toHaveFocus()
		await fireEvent.keyDown(pricing, { key: 'ArrowRight' })
		expect(trigger('Продукты')).toHaveFocus()
		await fireEvent.keyDown(trigger('Продукты'), { key: 'ArrowLeft' })
		expect(pricing).toHaveFocus()
		await fireEvent.keyDown(pricing, { key: 'Home' })
		expect(trigger('Продукты')).toHaveFocus()
		await fireEvent.keyDown(trigger('Продукты'), { key: 'Tab' })

		await fireEvent.click(trigger('Продукты'))
		await fireEvent.keyDown(trigger('Продукты'), { key: 'ArrowRight' })
		expect(trigger('Ресурсы')).toHaveAttribute('aria-expanded', 'true')
		await fireEvent.keyDown(trigger('Ресурсы'), { key: 'End' })
		expect(trigger('Ресурсы')).toHaveAttribute('aria-expanded', 'false')
	})

	it('стрелка вниз открывает панель и ставит фокус на первую ссылку, вверх — на последнюю', async () => {
		render(BaseMegaMenu, { props: { items: ITEMS } })

		await fireEvent.keyDown(trigger('Продукты'), { key: 'ArrowDown' })
		await waitFor(() => expect(screen.getByRole('link', { name: /Аналитика/ })).toHaveFocus())

		await fireEvent.keyDown(trigger('Продукты'), { key: 'ArrowUp' })
		await waitFor(() => expect(screen.getByRole('link', { name: /Подробнее/ })).toHaveFocus())

		await fireEvent.keyDown(screen.getByRole('link', { name: 'Цены' }), { key: 'ArrowDown' })
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'true')
	})

	it('в панели стрелки ходят по ссылкам и колонкам, Escape возвращает фокус на раздел', async () => {
		render(BaseMegaMenu, { props: { items: ITEMS } })
		await fireEvent.keyDown(trigger('Продукты'), { key: 'ArrowDown' })
		const analytics = screen.getByRole('link', { name: /Аналитика/ })
		await waitFor(() => expect(analytics).toHaveFocus())

		await fireEvent.keyDown(analytics, { key: 'ArrowDown' })
		expect(screen.getByRole('link', { name: /Документы/ })).toHaveFocus()
		await fireEvent.keyDown(screen.getByRole('link', { name: /Документы/ }), { key: 'ArrowRight' })
		expect(screen.getByRole('link', { name: /Почта/ })).toHaveFocus()
		await fireEvent.keyDown(screen.getByRole('link', { name: /Почта/ }), { key: 'ArrowLeft' })
		expect(analytics).toHaveFocus()
		await fireEvent.keyDown(analytics, { key: 'ArrowUp' })
		expect(screen.getByRole('link', { name: /Подробнее/ })).toHaveFocus()
		await fireEvent.keyDown(screen.getByRole('link', { name: /Подробнее/ }), { key: 'a' })

		await fireEvent.keyDown(document, { key: 'Escape' })
		expect(trigger('Продукты')).toHaveFocus()
		expect(trigger('Продукты')).toHaveAttribute('aria-expanded', 'false')
	})
})

describe('BaseMegaMenu: мобильный вид', () => {
	it('уже mobileBreakpoint строка сворачивается в кнопку «Меню», панель — под разделом', async () => {
		setViewport(500)
		const { emitted } = render(BaseMegaMenu, { props: { items: ITEMS } })
		const toggle = screen.getByRole('button', { name: 'Меню' })

		expect(toggle).toHaveAttribute('aria-expanded', 'false')
		expect(screen.getByRole('list', { hidden: true })).not.toBeVisible()

		await fireEvent.click(toggle)
		expect(toggle).toHaveAttribute('aria-expanded', 'true')

		await fireEvent.click(trigger('Продукты'))
		const panel = item('Продукты').querySelector('.base-mega-menu__panel--inline') as HTMLElement
		expect(within(panel).getByRole('link', { name: /Аналитика/ })).toBeInTheDocument()
		await fireEvent.keyDown(within(panel).getByRole('link', { name: /Аналитика/ }), { key: 'ArrowDown' })
		expect(within(panel).getByRole('link', { name: /Документы/ })).toHaveFocus()

		await fireEvent.click(within(panel).getByRole('link', { name: /Документы/ }))
		expect(emitted().select).toHaveLength(1)
		expect(toggle).toHaveAttribute('aria-expanded', 'false')

		await fireEvent.click(toggle)
		await fireEvent.click(toggle)
		expect(toggle).toHaveAttribute('aria-expanded', 'false')
	})
})

describe('BaseMegaMenu: слоты', () => {
	it('link и promo заменяют содержимое ссылки и промо-блока', async () => {
		render(BaseMegaMenu, {
			props: { items: ITEMS },
			slots: {
				link: '<template #link="{ link, group }">{{ link.label }} · {{ group.title }}</template>',
				promo: '<template #promo="{ promo, item }">{{ promo.title }} для {{ item.label }}</template>',
			},
		})

		await fireEvent.click(trigger('Продукты'))
		expect(screen.getByRole('link', { name: 'Аналитика · Платформа' })).toBeInTheDocument()
		expect(screen.getByText('Rise 2.0 для Продукты')).toBeInTheDocument()
	})

	it('слоты работают и в мобильном виде', async () => {
		setViewport(500)
		render(BaseMegaMenu, {
			props: { items: ITEMS, openKey: 'products' },
			slots: {
				link: '<template #link="{ link }">[{{ link.label }}]</template>',
				promo: '<template #promo="{ promo }">({{ promo.title }})</template>',
			},
		})

		expect(screen.getByText('[Аналитика]')).toBeInTheDocument()
		expect(screen.getByText('(Rise 2.0)')).toBeInTheDocument()
	})
})
