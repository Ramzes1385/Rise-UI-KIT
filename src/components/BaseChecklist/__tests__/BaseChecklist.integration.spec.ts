import '@testing-library/jest-dom/vitest'
import BaseChecklist from '../ui/BaseChecklist.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

describe('BaseChecklist integration', () => {
	it('Tab к флажку, пробел отмечает шаг, Tab к кнопке действия и Enter', async () => {
		const user = userEvent.setup()
		const items = [
			{ id: 'a', title: 'Установить' },
			{ id: 'b', title: 'Подключить', actionLabel: 'Инструкция' },
		]
		const { emitted } = render(BaseChecklist, { props: { items } })

		await user.tab()
		expect(screen.getByRole('checkbox', { name: 'Установить' })).toHaveFocus()
		await user.keyboard(' ')
		expect(emitted('update:completed')).toEqual([[['a']]])
		await user.tab()
		await user.tab()
		expect(screen.getByRole('button', { name: 'Инструкция' })).toHaveFocus()
		await user.keyboard('{Enter}')
		expect(emitted('action')).toEqual([[items[1]]])
	})
})
