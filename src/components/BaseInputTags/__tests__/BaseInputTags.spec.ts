import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseInputTags from '../ui/BaseInputTags.vue'

describe('BaseInputTags', () => {
	it('теги — список с именем, у каждого кнопка «Удалить …» вне порядка Tab; поле с подписью', () => {
		render(BaseInputTags, { props: { modelValue: ['Vue', 'Vite'], label: 'Навыки', inputAttrs: { name: 'skills' } } })

		expect(screen.getByRole('list', { name: 'Теги' })).toBeInTheDocument()
		expect(screen.getAllByRole('listitem')).toHaveLength(2)
		expect(screen.getByRole('button', { name: 'Удалить Vite' })).toHaveAttribute('tabindex', '-1')
		const field = screen.getByRole('textbox', { name: 'Навыки' })
		expect(field).toHaveAttribute('name', 'skills')
		expect(field).toHaveAttribute('autocomplete', 'off')
	})

	it('без тегов списка нет; отключённое поле и только чтение — без кнопок удаления', async () => {
		const { rerender } = render(BaseInputTags, { props: { modelValue: [], ariaLabel: 'Теги задачи' } })

		expect(screen.queryByRole('list')).toBeNull()
		await rerender({ modelValue: ['срочно'], isDisabled: true })
		expect(screen.queryByRole('button')).toBeNull()
		expect(screen.getByRole('list', { name: 'Теги' })).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByRole('textbox', { name: 'Теги задачи' })).toBeDisabled()
		await rerender({ isDisabled: false, isReadonly: true })
		expect(screen.queryByRole('button')).toBeNull()
	})
})
