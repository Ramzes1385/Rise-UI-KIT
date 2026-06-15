/**
 * Integration-тесты для BaseAccordion.
 * Проверяют взаимодействие: клики, клавиатура, переключение, слоты.
 */

import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

import type { BaseAccordionItem } from '../model/BaseAccordion.types'
import BaseAccordion from '../ui/BaseAccordion.vue'

/** Стандартный набор элементов для тестов */
const ITEMS: BaseAccordionItem[] = [
	{ label: 'Материалы', content: 'Работаем с металлом' },
	{ label: 'Доставка', content: 'Доставка по всей России' },
	{ label: 'Гарантия', content: 'Гарантия 2 года', isDisabled: true },
]

describe('BaseAccordion integration', () => {
	describe('переключение по клику', () => {
		it('должен открывать закрытый элемент по клику на заголовок', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseAccordion, { props: { items: ITEMS } })

			const header = screen.getByText('Материалы')
			await user.click(header)

			const openItems = container.querySelectorAll('.base-accordion__item--open')
			expect(openItems).toHaveLength(1)
		})

		it('должен закрывать открытый элемент по повторному клику', async () => {
			const user = userEvent.setup()
			const items: BaseAccordionItem[] = [{ label: 'Открытый', content: 'Контент', defaultOpen: true }]
			const { container } = render(BaseAccordion, { props: { items } })

			await waitFor(() => {
				expect(container.querySelectorAll('.base-accordion__item--open')).toHaveLength(1)
			})

			const header = screen.getByText('Открытый')
			await user.click(header)

			expect(container.querySelectorAll('.base-accordion__item--open')).toHaveLength(0)
		})

		it('должен закрывать предыдущий элемент при открытии нового (режим single)', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseAccordion, {
				props: { items: ITEMS, isMultiple: false },
			})

			await user.click(screen.getByText('Материалы'))
			expect(container.querySelectorAll('.base-accordion__item--open')).toHaveLength(1)

			await user.click(screen.getByText('Доставка'))
			const openItems = container.querySelectorAll('.base-accordion__item--open')
			expect(openItems).toHaveLength(1)
		})
	})

	describe('режим isMultiple', () => {
		it('должен оставлять открытым предыдущий элемент при открытии нового', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseAccordion, {
				props: { items: ITEMS, isMultiple: true },
			})

			await user.click(screen.getByText('Материалы'))
			await user.click(screen.getByText('Доставка'))

			expect(container.querySelectorAll('.base-accordion__item--open')).toHaveLength(2)
		})

		it('должен закрывать каждый элемент по повторному клику в режиме multiple', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseAccordion, {
				props: { items: ITEMS, isMultiple: true },
			})

			await user.click(screen.getByText('Материалы'))
			await user.click(screen.getByText('Доставка'))
			expect(container.querySelectorAll('.base-accordion__item--open')).toHaveLength(2)

			await user.click(screen.getByText('Материалы'))
			expect(container.querySelectorAll('.base-accordion__item--open')).toHaveLength(1)
		})
	})

	describe('отключённый элемент', () => {
		it('не должен открывать отключённый элемент по клику', async () => {
			const { container } = render(BaseAccordion, { props: { items: ITEMS } })

			await fireEvent.click(screen.getByText('Гарантия'))

			const openItems = container.querySelectorAll('.base-accordion__item--open')
			expect(openItems).toHaveLength(0)
		})
	})

	describe('клавиатурная навигация', () => {
		it('должен открывать элемент по нажатию Enter на заголовке', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseAccordion, { props: { items: ITEMS } })

			const header = screen.getByText('Материалы')
			const headerEl = header.closest('.base-accordion__header') as HTMLElement | null
			headerEl?.focus()

			await user.keyboard('{Enter}')

			const openItems = container.querySelectorAll('.base-accordion__item--open')
			expect(openItems).toHaveLength(1)
		})

		it('должен закрывать элемент по повторному нажатию Enter', async () => {
			const user = userEvent.setup()
			const items: BaseAccordionItem[] = [{ label: 'Открытый', content: 'Контент', defaultOpen: true }]
			const { container } = render(BaseAccordion, { props: { items } })

			const header = screen.getByText('Открытый')
			const headerEl = header.closest('.base-accordion__header') as HTMLElement | null
			headerEl?.focus()

			await user.keyboard('{Enter}')

			expect(container.querySelectorAll('.base-accordion__item--open')).toHaveLength(0)
		})
	})

	describe('слоты', () => {
		it('должен рендерить именованный слот вместо контента', () => {
			const items: BaseAccordionItem[] = [{ label: 'Галерея', slot: 'gallery' }]

			render(BaseAccordion, {
				props: { items },
				slots: {
					gallery: '<div data-testid="slot-content">Слот-контент</div>',
				},
			})

			expect(screen.getByTestId('slot-content')).toBeInTheDocument()
			expect(screen.getByText('Слот-контент')).toBeInTheDocument()
		})

		it('должен рендерить контент по умолчанию когда слот не указан', () => {
			const items: BaseAccordionItem[] = [{ label: 'Описание', content: 'Текстовый контент' }]

			render(BaseAccordion, { props: { items } })

			expect(screen.getByText('Текстовый контент')).toBeInTheDocument()
		})
	})

	describe('collapse-контейнер', () => {
		it('должен добавлять класс --open на collapse при открытии', async () => {
			const user = userEvent.setup()
			const { container } = render(BaseAccordion, { props: { items: ITEMS } })

			await user.click(screen.getByText('Материалы'))

			const openCollapse = container.querySelectorAll('.base-accordion__collapse--open')
			expect(openCollapse).toHaveLength(1)
		})
	})

	describe('emit toggle', () => {
		it('должен эмитить toggle с index и isOpen при открытии', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseAccordion, { props: { items: ITEMS } })

			await user.click(screen.getByText('Материалы'))

			const toggleEvents = emitted()['toggle']
			expect(toggleEvents).toBeTruthy()
			expect(toggleEvents?.[0]).toEqual([0, true])
		})

		it('должен эмитить toggle с isOpen=false при закрытии', async () => {
			const user = userEvent.setup()
			const items: BaseAccordionItem[] = [{ label: 'Открытый', content: 'Контент', defaultOpen: true }]
			const { emitted } = render(BaseAccordion, { props: { items } })

			await waitFor(() => {
				expect(screen.getByText('Открытый')).toBeInTheDocument()
			})

			await user.click(screen.getByText('Открытый'))

			const toggleEvents = emitted()['toggle']
			expect(toggleEvents).toBeTruthy()
			expect(toggleEvents?.[0]).toEqual([0, false])
		})
	})
})
