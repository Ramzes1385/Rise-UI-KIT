import '@testing-library/jest-dom/vitest'
import BaseAvatarGroup from '../ui/BaseAvatarGroup.vue'
import { render, screen, waitFor } from '@testing-library/vue'

const PEOPLE = ['Анна', 'Борис', 'Вера', 'Глеб', 'Дина', 'Егор'].map(name => ({ name }))
const global = { stubs: { TransitionGroup: false } }

describe('BaseAvatarGroup', () => {
	it('список с именем группы: аватары скрыты, имена — скрытым текстом, остаток «+N» и «и ещё N»', () => {
		const { container } = render(BaseAvatarGroup, { props: { items: PEOPLE, max: 3, ariaLabel: 'Участники' }, global })

		expect(screen.getByRole('list', { name: 'Участники' })).toBeInTheDocument()
		expect(screen.getAllByRole('listitem')).toHaveLength(4)
		expect(container.querySelector('.base-avatar')).toHaveAttribute('aria-hidden', 'true')
		expect(screen.getByText('Анна')).toHaveClass('base-avatar-group__name')
		expect(screen.getByText('+3')).toHaveAttribute('aria-hidden', 'true')
		expect(screen.getByText('и ещё 3')).toBeInTheDocument()
	})

	it('лишний один человек показывается вместо «+1»; max 0 — только остаток; квадратная форма', () => {
		const { rerender, container } = render(BaseAvatarGroup, { props: { items: PEOPLE.slice(0, 4), max: 3 }, global })
		expect(screen.getAllByRole('listitem')).toHaveLength(4)
		expect(screen.queryByText(/и ещё/)).toBeNull()

		return rerender({ items: PEOPLE, max: 0, shape: 'square' }).then(async () => {
			await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1))
			expect(screen.getByText('+6')).toBeInTheDocument()
			expect(container.querySelector('.base-avatar-group__more')).toHaveClass('base-avatar-group__more--square')
		})
	})
})
