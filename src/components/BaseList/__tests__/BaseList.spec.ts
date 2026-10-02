import '@testing-library/jest-dom/vitest'
import BaseList from '../ui/BaseList.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const items = [
	{ id: 'a', title: 'Альфа' },
	{ id: 'b', title: 'Бета' },
]

describe('BaseList unit', () => {
	it('связывает подпись со списком выбора', () => {
		render(BaseList, { props: { items, label: 'Разделы', selectionMode: 'single' } })
		expect(screen.getByRole('listbox', { name: 'Разделы' })).toBeInTheDocument()
	})

	it('эмитит update:modelValue при клике по строке', async () => {
		const { emitted } = render(BaseList, { props: { items, label: 'Разделы', selectionMode: 'single' } })
		await fireEvent.click(screen.getByRole('option', { name: 'Бета' }))
		expect(emitted()['update:modelValue']).toEqual([['b']])
	})

	it('связывает ошибку со списком и помечает его невалидным', () => {
		render(BaseList, { props: { items, label: 'Разделы', selectionMode: 'single', error: 'Выберите раздел' } })
		const list = screen.getByRole('listbox')
		expect(list).toHaveAccessibleDescription('Выберите раздел')
		expect(list).toHaveAttribute('aria-invalid', 'true')
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseList, { props: { items, variant: 'soft' } })
		expect(container.querySelector('.base-list')).toHaveClass('base-list--soft')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseList, { props: { items, sizeScale: 125 } })
		expect((container.querySelector('.base-list') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseList, { props: { items, customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-list')).toHaveClass('my-root')
	})
})
