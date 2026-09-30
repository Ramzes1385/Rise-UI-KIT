import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import BaseCommandPalette from '../ui/BaseCommandPalette.vue'
import { render, screen, waitFor } from '@testing-library/vue'

describe('BaseCommandPalette integration', () => {
	it('Ctrl+K, поиск, стрелка вниз и Enter; фокус возвращается', async () => {
		const user = userEvent.setup()
		const trigger = document.createElement('button')
		document.body.append(trigger)
		trigger.focus()
		const commands = [
			{ id: 'a', label: 'Открыть файл' },
			{ id: 'b', label: 'Открыть папку' },
		]
		const { emitted } = render(BaseCommandPalette, { props: { commands } })

		await user.keyboard('{Control>}k{/Control}')
		const search = await screen.findByRole('combobox', { name: 'Поиск команды' })
		await waitFor(() => expect(search).toHaveFocus())
		await user.keyboard('открыть{ArrowDown}{Enter}')
		expect(emitted('select')).toEqual([[commands[1]]])
		await waitFor(() => expect(trigger).toHaveFocus())
		trigger.remove()
	})
})
