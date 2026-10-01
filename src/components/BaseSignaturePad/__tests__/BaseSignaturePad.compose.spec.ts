import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseSignaturePad from '../ui/BaseSignaturePad.vue'

describe('BaseSignaturePad: подпись и ошибка на FormFieldLabel/FormFieldError', () => {
	it('группа названа подписью через aria-labelledby, ошибка в aria-describedby', () => {
		render(BaseSignaturePad, { props: { label: 'Подпись клиента', error: 'Нужна подпись' } })
		const group = screen.getByRole('group', { name: 'Подпись клиента' })
		const label = document.getElementById(group.getAttribute('aria-labelledby')!)
		const errorIds = group.getAttribute('aria-describedby')!.split(' ')
		const error = screen.getByText('Нужна подпись')

		expect(label).toHaveTextContent('Подпись клиента')
		expect(label?.tagName).toBe('SPAN')
		expect(group).not.toHaveAttribute('aria-label')
		expect(errorIds).toContain(error.id)
		expect(error.tagName).toBe('SPAN')
		expect(group).toHaveAccessibleDescription('Нужна подпись')
	})

	it('прежние классы и ключи customClass label/error', () => {
		render(BaseSignaturePad, {
			props: { label: 'Подпись', error: 'Ошибка', customClass: { label: 'my-label', error: 'my-error' } },
		})

		expect(screen.getByText('Подпись')).toHaveClass('base-signature-pad__label', 'my-label')
		expect(screen.getByText('Ошибка')).toHaveClass('base-signature-pad__error', 'my-error')
	})
})
