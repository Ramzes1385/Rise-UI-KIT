/**
 * Unit-тесты BaseButtonGroup: группа с именем, направление, содержимое.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'
import BaseButtonGroup from '../ui/BaseButtonGroup.vue'

describe('BaseButtonGroup', () => {
	it('группа с именем, кнопки из слота, горизонтально по умолчанию', () => {
		render(BaseButtonGroup, {
			props: { ariaLabel: 'Выравнивание' },
			slots: { default: '<button>Слева</button><button>По центру</button>' },
		})

		const group = screen.getByRole('group', { name: 'Выравнивание' })
		expect(group).toHaveClass('base-button-group--horizontal')
		expect(screen.getAllByRole('button')).toHaveLength(2)
	})

	it('вертикальная группа', () => {
		render(BaseButtonGroup, { props: { orientation: 'vertical' }, slots: { default: '<button>A</button>' } })

		expect(screen.getByRole('group')).toHaveClass('base-button-group--vertical')
	})
})
