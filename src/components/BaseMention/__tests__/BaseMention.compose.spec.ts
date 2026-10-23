import '@testing-library/jest-dom/vitest'
import BaseMention from '../ui/BaseMention.vue'
import { render, screen } from '@testing-library/vue'

describe('BaseMention: подпись и ошибка на FormFieldLabel/FormFieldError', () => {
	it('поле названо подписью, aria-describedby указывает на ошибку', () => {
		render(BaseMention, { props: { label: 'Комментарий', error: 'Нужно упоминание', options: [] } })
		const field = screen.getByRole('textbox', { name: 'Комментарий' })
		const error = document.getElementById(field.getAttribute('aria-describedby')!)

		expect(screen.getByLabelText('Комментарий')).toBe(field)
		expect(error).toHaveTextContent('Нужно упоминание')
		expect(error?.tagName).toBe('SPAN')
		expect(field).toHaveAccessibleDescription('Нужно упоминание')
	})

	it('прежние классы и ключи customClass label/error', () => {
		const { container } = render(BaseMention, {
			props: { label: 'Комментарий', error: 'Ошибка', options: [], customClass: { label: 'my-label', error: 'my-error' } },
		})
		const label = container.querySelector('label')

		expect(label).toHaveClass('base-mention__label', 'my-label')
		expect(label).toHaveTextContent('Комментарий')
		expect(screen.getByText('Ошибка')).toHaveClass('base-mention__error', 'my-error')
	})

	it('без label и error — нет подписи и описания', () => {
		const { container } = render(BaseMention, { props: { options: [] } })

		expect(container.querySelector('.base-mention__label')).toBeNull()
		expect(container.querySelector('.base-mention__error')).toBeNull()
		expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby')
	})
})
