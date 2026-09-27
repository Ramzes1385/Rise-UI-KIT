/**
 * Unit-тесты BaseInplace: кнопка просмотра, имя, подсказка, пустое значение.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseInplace from '../ui/BaseInplace.vue'

describe('BaseInplace', () => {
	it('в просмотре — кнопка «что: значение» с подсказкой; слот display', () => {
		render(BaseInplace, { props: { modelValue: 'Альфа', label: 'Проект' }, slots: { display: '<template #display="{ value }"><b>{{ value }}</b></template>' } })

		const display = screen.getByRole('button', { name: 'Проект: Альфа' })
		expect(display).toHaveAccessibleDescription('Нажмите, чтобы изменить')
		expect(display.querySelector('b')).toHaveTextContent('Альфа')
	})

	it('пустое значение — плейсхолдер; по умолчанию «—»', () => {
		const { container } = render(BaseInplace, { props: { label: 'Заметка' } })

		expect(screen.getByRole('button', { name: 'Заметка: —' })).toBeInTheDocument()
		expect(container.querySelector('.base-inplace__display')).toHaveClass('base-inplace__display--empty')
	})
})
