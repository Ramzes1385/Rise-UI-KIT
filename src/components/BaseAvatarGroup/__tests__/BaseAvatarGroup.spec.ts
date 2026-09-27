/**
 * Unit-тесты BaseAvatarGroup: список, имена, остаток «+N».
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseAvatarGroup from '../ui/BaseAvatarGroup.vue'

const PEOPLE = ['Анна', 'Борис', 'Вера', 'Глеб', 'Дина', 'Егор'].map(name => ({ name }))

describe('BaseAvatarGroup', () => {
	it('список с именем группы: аватары скрыты, имена — скрытым текстом, остаток «+N» и «и ещё N»', () => {
		const { container } = render(BaseAvatarGroup, { props: { items: PEOPLE, max: 3, ariaLabel: 'Участники' } })

		expect(screen.getByRole('list', { name: 'Участники' })).toBeInTheDocument()
		expect(screen.getAllByRole('listitem')).toHaveLength(4)
		expect(container.querySelector('.base-avatar')).toHaveAttribute('aria-hidden', 'true')
		expect(screen.getByText('Анна')).toHaveClass('base-avatar-group__name')
		expect(screen.getByText('+3')).toHaveAttribute('aria-hidden', 'true')
		expect(screen.getByText('и ещё 3')).toBeInTheDocument()
	})

	it('лишний один человек показывается вместо «+1»; max 0 — только остаток; квадратная форма', () => {
		const { rerender, container } = render(BaseAvatarGroup, { props: { items: PEOPLE.slice(0, 4), max: 3 } })
		expect(screen.getAllByRole('listitem')).toHaveLength(4)
		expect(screen.queryByText(/и ещё/)).toBeNull()

		return rerender({ items: PEOPLE, max: 0, shape: 'square' }).then(() => {
			expect(screen.getAllByRole('listitem')).toHaveLength(1)
			expect(screen.getByText('+6')).toBeInTheDocument()
			expect(container.querySelector('.base-avatar-group__more')).toHaveClass('base-avatar-group__more--square')
		})
	})
})
