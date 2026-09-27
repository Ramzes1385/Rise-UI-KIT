/**
 * Unit-тесты BaseSplitButton: две кнопки в группе, имя кнопки меню, состояния.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseSplitButton from '../ui/BaseSplitButton.vue'

const ITEMS = [{ label: 'Сохранить копию' }]

describe('BaseSplitButton', () => {
	it('группа из основной кнопки и кнопки меню с aria-haspopup', () => {
		render(BaseSplitButton, { props: { label: 'Сохранить', items: ITEMS } })

		expect(screen.getByRole('group', { name: 'Сохранить' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Другие действия' })).toHaveAttribute('aria-haspopup', 'menu')
	})

	it('своё имя меню, слот основной кнопки, отключение и загрузка', () => {
		render(BaseSplitButton, { props: { items: ITEMS, menuLabel: 'Ещё', isDisabled: true, isLoading: true }, slots: { default: 'Отправить' } })

		expect(screen.getByRole('button', { name: 'Ещё' })).toBeDisabled()
		expect(screen.getByRole('button', { name: /Отправить/ })).toHaveAttribute('aria-busy', 'true')
	})
})
