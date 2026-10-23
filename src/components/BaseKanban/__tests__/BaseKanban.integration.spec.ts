import '@testing-library/jest-dom/vitest'
import { config } from '@vue/test-utils'
import BaseKanban from '../ui/BaseKanban.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

config.global.stubs = { ...config.global.stubs, 'transition-group': false }

describe('BaseKanban integration', () => {
	it('Tab на доску, Space, стрелка вправо, Space — карточка в соседней колонке', async () => {
		const user = userEvent.setup()
		const columns = [
			{ id: 'todo', title: 'План' },
			{ id: 'done', title: 'Готово' },
		]
		const cards = [{ id: 'a', columnId: 'todo', title: 'Альфа' }]
		const { emitted } = render(BaseKanban, { props: { columns, cards } })

		await user.tab()
		expect(screen.getByRole('button', { name: 'Альфа' })).toHaveFocus()
		await user.keyboard(' {ArrowRight} ')
		expect(emitted('update:cards')).toEqual([[[{ ...cards[0], columnId: 'done' }]]])
		expect(screen.getByRole('list', { name: 'Готово, 1 карточка' })).toContainElement(screen.getByRole('button', { name: 'Альфа' }))
		expect(screen.getByRole('button', { name: 'Альфа' })).toHaveFocus()
	})
})
