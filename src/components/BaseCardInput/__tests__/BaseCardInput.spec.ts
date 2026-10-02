import '@testing-library/jest-dom/vitest'
import BaseCardInput from '../ui/BaseCardInput.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseCardInput unit', () => {
	it('связывает подпись с полем', () => {
		render(BaseCardInput, { props: { label: 'Название' } })
		expect(screen.getByLabelText('Название')).toBeInTheDocument()
	})

	it('эмитит update:modelValue при вводе', async () => {
		const { emitted } = render(BaseCardInput, { props: { label: 'Название' } })
		await fireEvent.update(screen.getByLabelText('Название'), 'Отчёт')
		expect(emitted()['update:modelValue']).toEqual([['Отчёт']])
	})

	it('связывает ошибку с полем и помечает его невалидным', () => {
		render(BaseCardInput, { props: { label: 'Название', error: 'Заполните название' } })
		const field = screen.getByLabelText('Название')
		expect(field).toHaveAccessibleDescription('Заполните название')
		expect(field).toHaveAttribute('aria-invalid', 'true')
	})

	it('без ошибки не ставит aria-invalid и aria-describedby', () => {
		render(BaseCardInput, { props: { label: 'Название' } })
		const field = screen.getByLabelText('Название')
		expect(field).not.toHaveAttribute('aria-invalid')
		expect(field).not.toHaveAttribute('aria-describedby')
	})

	it('отключает поле при isDisabled', () => {
		render(BaseCardInput, { props: { label: 'Название', isDisabled: true } })
		expect(screen.getByLabelText('Название')).toBeDisabled()
	})

	it('добавляет модификатор варианта, кроме default', () => {
		const { container } = render(BaseCardInput, { props: { variant: 'soft' } })
		expect(container.querySelector('.base-card-input')).toHaveClass('base-card-input--soft')
	})

	it('пишет --size-scale только при масштабе, отличном от 100', () => {
		const { container } = render(BaseCardInput, { props: { sizeScale: 125 } })
		expect((container.querySelector('.base-card-input') as HTMLElement).style.getPropertyValue('--size-scale')).toBe('1.25')
	})

	it('добавляет customClass к корню', () => {
		const { container } = render(BaseCardInput, { props: { customClass: { root: 'my-root' } } })
		expect(container.querySelector('.base-card-input')).toHaveClass('my-root')
	})
})
