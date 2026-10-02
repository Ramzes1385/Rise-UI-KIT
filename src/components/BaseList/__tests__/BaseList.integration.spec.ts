import '@testing-library/jest-dom/vitest'
import BaseList from '../ui/BaseList.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

describe('BaseList integration', () => {
	it('выбирает строку пробелом после Tab и стрелки', async () => {
		const user = userEvent.setup()
		const items = [
			{ id: 'a', title: 'Альфа' },
			{ id: 'b', title: 'Бета' },
		]
		const { emitted } = render(BaseList, { props: { items, ariaLabel: 'Разделы', selectionMode: 'multiple' } })
		await user.tab()
		await user.keyboard('{ArrowDown} ')
		expect(screen.getByRole('option', { name: 'Бета' })).toHaveFocus()
		expect(emitted()['update:modelValue']).toEqual([[['b']]])
	})
})
