import '@testing-library/jest-dom/vitest'
import BaseAccordion from '../ui/BaseAccordion.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import type { BaseAccordionItem } from '../types/BaseAccordion.types'

const ITEMS: BaseAccordionItem[] = [
	{ label: 'Материалы', content: 'Работаем с металлом' },
	{ label: 'Доставка', content: 'Доставка по всей России' },
	{ label: 'Гарантия', content: 'Гарантия 2 года', isDisabled: true },
]

const header = (name: string) => screen.getByRole('button', { name })

describe('BaseAccordion по шаблону Accordion WAI-ARIA', () => {
	describe('разметка (ACC-2)', () => {
		it('кнопка пункта — нативная <button> внутри заголовка <h3>', () => {
			render(BaseAccordion, { props: { items: ITEMS } })

			const headings = screen.getAllByRole('heading', { level: 3 })
			expect(headings).toHaveLength(3)
			expect(headings[0]).toContainElement(header('Материалы'))
			expect(header('Материалы').tagName).toBe('BUTTON')
			expect(header('Материалы')).toHaveAttribute('type', 'button')
		})

		it('headingLevel меняет уровень заголовка', () => {
			render(BaseAccordion, { props: { items: ITEMS, headingLevel: 2 } })

			expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
		})

		it('aria-expanded и aria-controls ведут к панели region с именем пункта', async () => {
			const user = userEvent.setup()
			render(BaseAccordion, { props: { items: ITEMS } })

			const button = header('Материалы')
			expect(button).toHaveAttribute('aria-expanded', 'false')
			await user.click(button)

			expect(button).toHaveAttribute('aria-expanded', 'true')
			const panel = document.getElementById(button.getAttribute('aria-controls')!)
			expect(panel).toHaveAttribute('role', 'region')
			expect(screen.getByRole('region', { name: 'Материалы' })).toBe(panel)
		})

		it('отключённый пункт остаётся в порядке Tab с aria-disabled и не открывается', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseAccordion, { props: { items: ITEMS } })

			await user.tab()
			await user.tab()
			await user.tab()
			expect(header('Гарантия')).toHaveFocus()
			expect(header('Гарантия')).toHaveAttribute('aria-disabled', 'true')
			await user.keyboard('{Enter}')

			expect(header('Гарантия')).toHaveAttribute('aria-expanded', 'false')
			expect(emitted('toggle')).toBeUndefined()
		})
	})

	describe('клавиатура', () => {
		it('Tab переходит между заголовками, Enter и Space открывают и закрывают', async () => {
			const user = userEvent.setup()
			render(BaseAccordion, { props: { items: ITEMS, isMultiple: true } })

			await user.tab()
			expect(header('Материалы')).toHaveFocus()
			await user.keyboard('{Enter}')
			expect(header('Материалы')).toHaveAttribute('aria-expanded', 'true')

			await user.tab()
			expect(screen.getByText('Работаем с металлом')).toBeVisible()
			await user.tab({ shift: true })
			await user.tab()
			expect(header('Доставка')).toHaveFocus()
			await user.keyboard(' ')
			expect(header('Доставка')).toHaveAttribute('aria-expanded', 'true')
			await user.keyboard(' ')
			expect(header('Доставка')).toHaveAttribute('aria-expanded', 'false')
		})
	})

	describe('v-model:open (ACC-4)', () => {
		it('open задаёт открытые пункты по ключу, смена open снаружи открывает другой', async () => {
			const { rerender } = render(BaseAccordion, { props: { items: ITEMS, open: ['Доставка'] } })

			expect(header('Доставка')).toHaveAttribute('aria-expanded', 'true')
			await rerender({ open: ['Материалы'] })

			expect(header('Материалы')).toHaveAttribute('aria-expanded', 'true')
			expect(header('Доставка')).toHaveAttribute('aria-expanded', 'false')
		})

		it('клик эмитит update:open с новым списком ключей', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseAccordion, { props: { items: ITEMS, isMultiple: true, open: ['Материалы'] } })

			await user.click(header('Доставка'))
			await user.click(header('Материалы'))

			expect(emitted('update:open')).toEqual([[['Материалы', 'Доставка']], [['Доставка']]])
		})

		it('id пункта — ключ вместо label', async () => {
			const user = userEvent.setup()
			const items = [
				{ id: 'a', label: 'Первый' },
				{ id: 'b', label: 'Второй' },
			]
			const { emitted } = render(BaseAccordion, { props: { items } })

			await user.click(header('Второй'))

			expect(emitted('update:open')).toEqual([[['b']]])
		})

		it('без isMultiple открытие другого пункта эмитит закрытие прежнего', async () => {
			const user = userEvent.setup()
			const { emitted } = render(BaseAccordion, { props: { items: ITEMS } })

			await user.click(header('Материалы'))
			await user.click(header('Доставка'))

			expect(emitted('toggle')).toEqual([
				[0, true],
				[0, false],
				[1, true],
			])
		})

		it('без isMultiple из нескольких ключей open открыт только первый', () => {
			render(BaseAccordion, { props: { items: ITEMS, open: ['Материалы', 'Доставка'] } })

			expect(header('Материалы')).toHaveAttribute('aria-expanded', 'true')
			expect(header('Доставка')).toHaveAttribute('aria-expanded', 'false')
		})
	})

	describe('ключи пунктов (ACC-3)', () => {
		it('defaultOpen открыт сразу при создании, без ожидания монтирования', () => {
			const items = [{ label: 'Сразу', content: 'Текст', defaultOpen: true }]
			render(BaseAccordion, { props: { items } })

			expect(header('Сразу')).toHaveAttribute('aria-expanded', 'true')
		})

		it('открытый пункт остаётся открытым после удаления пункта перед ним', async () => {
			const user = userEvent.setup()
			const { rerender } = render(BaseAccordion, { props: { items: ITEMS } })

			await user.click(header('Доставка'))
			await rerender({ items: ITEMS.slice(1) })

			expect(header('Доставка')).toHaveAttribute('aria-expanded', 'true')
			expect(header('Гарантия')).toHaveAttribute('aria-expanded', 'false')
		})

		it('новый пункт с defaultOpen открывается при подгрузке', async () => {
			const { rerender, emitted } = render(BaseAccordion, { props: { items: ITEMS, isMultiple: true } })

			await rerender({ items: [...ITEMS, { label: 'Оплата', defaultOpen: true }] })

			expect(header('Оплата')).toHaveAttribute('aria-expanded', 'true')
			expect(emitted('update:open')).toEqual([[['Оплата']]])
		})

		it('с isMultiple новый defaultOpen добавляется к открытым, удалённые пункты уходят из списка', async () => {
			const user = userEvent.setup()
			const { rerender, emitted } = render(BaseAccordion, { props: { items: ITEMS, isMultiple: true } })

			await user.click(header('Материалы'))
			await user.click(header('Доставка'))
			await rerender({ items: [...ITEMS.slice(1), { label: 'Оплата', defaultOpen: true }] })

			expect(emitted('update:open')!.at(-1)).toEqual([['Доставка', 'Оплата']])
		})

		it('без isMultiple новый defaultOpen не закрывает уже открытый пункт', async () => {
			const user = userEvent.setup()
			const { rerender } = render(BaseAccordion, { props: { items: ITEMS } })

			await user.click(header('Материалы'))
			await rerender({ items: [...ITEMS, { label: 'Оплата', defaultOpen: true }] })

			expect(header('Материалы')).toHaveAttribute('aria-expanded', 'true')
			expect(header('Оплата')).toHaveAttribute('aria-expanded', 'false')
		})

		it('при управлении через open подгрузка пунктов ничего не открывает сама', async () => {
			const { rerender } = render(BaseAccordion, { props: { items: ITEMS, open: [] } })

			await rerender({ items: [...ITEMS, { label: 'Оплата', defaultOpen: true }] })

			expect(header('Оплата')).toHaveAttribute('aria-expanded', 'false')
		})

		it('пункты с одинаковым label получают разные ключи', async () => {
			const user = userEvent.setup()
			const items = [{ label: 'Вопрос' }, { label: 'Вопрос' }]
			const { emitted } = render(BaseAccordion, { props: { items, isMultiple: true } })

			const [first, second] = screen.getAllByRole('button', { name: 'Вопрос' })
			await user.click(first!)
			await user.click(second!)

			expect(emitted('update:open')!.at(-1)).toEqual([['Вопрос', 'Вопрос#1']])
		})
	})

	describe('defaultOpen в одиночном режиме (ACC-6)', () => {
		it('без isMultiple открыт только первый пункт с defaultOpen', () => {
			const items = ITEMS.map(item => ({ ...item, defaultOpen: true }))
			render(BaseAccordion, { props: { items } })

			expect(header('Материалы')).toHaveAttribute('aria-expanded', 'true')
			expect(header('Доставка')).toHaveAttribute('aria-expanded', 'false')
		})

		it('с isMultiple открыты все пункты с defaultOpen', () => {
			const items = ITEMS.slice(0, 2).map(item => ({ ...item, defaultOpen: true }))
			render(BaseAccordion, { props: { items, isMultiple: true } })

			expect(header('Материалы')).toHaveAttribute('aria-expanded', 'true')
			expect(header('Доставка')).toHaveAttribute('aria-expanded', 'true')
		})
	})
})
