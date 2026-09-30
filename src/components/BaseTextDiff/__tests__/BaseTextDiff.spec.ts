import '@testing-library/jest-dom/vitest'
import BaseTextDiff from '../ui/BaseTextDiff.vue'
import { render, screen } from '@testing-library/vue'

const PROPS = { before: 'Срок 10 дней\nСпоры в суде', after: 'Срок 5 дней\nСпоры в суде\nГарантия год', label: 'Договор' }

describe('BaseTextDiff', () => {
	it('одна колонка: номера, знаки, подписи для скринридера, <del> и <ins> у изменённых слов', () => {
		const { container } = render(BaseTextDiff, { props: PROPS })
		const rows = container.querySelectorAll('tbody tr')

		expect(screen.getByRole('figure', { name: 'Договор' })).toBeInTheDocument()
		expect(screen.getByText('Договор: добавлено строк — 2, удалено — 1')).toBeInTheDocument()
		expect(rows).toHaveLength(4)
		expect(rows[0]).toHaveClass('base-text-diff__cell--removed')
		expect(rows[0]).toHaveTextContent('1−УдаленоСрок 10 дней')
		expect(rows[1]).toHaveTextContent('1+ДобавленоСрок 5 дней')
		expect(rows[2]).toHaveTextContent('22Споры в суде')
		expect(container.querySelector('del')).toHaveTextContent('10')
		expect(container.querySelector('ins')).toHaveTextContent('5')
		expect(container.querySelector('.base-text-diff__count--added')).toHaveTextContent('+2')
		expect(screen.queryByText('Изменений нет')).toBeNull()
	})

	it('рядом: заголовки колонок, пустые клетки у строк без пары; свои заголовки', async () => {
		const { container, rerender } = render(BaseTextDiff, { props: { ...PROPS, mode: 'split' } })

		expect(screen.getAllByRole('columnheader').map(header => header.textContent)).toEqual(['Было', 'Стало'])
		expect(container.querySelectorAll('tbody tr')).toHaveLength(3)
		expect(container.querySelectorAll('.base-text-diff__cell--empty')).toHaveLength(2)
		await rerender({ beforeLabel: 'Черновик', afterLabel: 'Итог' })
		expect(screen.getByRole('columnheader', { name: 'Черновик' })).toBeInTheDocument()
	})

	it('одинаковые тексты — «Изменений нет»; вариант, размер и customClass', () => {
		const { container } = render(BaseTextDiff, {
			props: { before: 'a', after: 'a', label: 'Текст', variant: 'outline', customClass: { table: 'table-x' } },
		})

		expect(screen.getByText('Изменений нет')).toBeInTheDocument()
		expect(container.querySelector('.base-text-diff')).toHaveClass('base-text-diff--outline')
		expect(container.querySelector('table')).toHaveClass('table-x')
	})
})
