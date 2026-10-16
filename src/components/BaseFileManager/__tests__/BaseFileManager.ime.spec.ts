import '@testing-library/jest-dom/vitest'
import { renderManager } from './fixtures'
import userEvent from '@testing-library/user-event'
import { UI_FILE_MANAGER } from '@/locales/messages'
import { fireEvent, screen, within } from '@testing-library/vue'

describe('BaseFileManager: ввод имени через IME', () => {
	it('Safari: Enter и Escape с keyCode 229 не подтверждают и не закрывают поле имени', async () => {
		const { emitted } = renderManager({ selected: ['logo'] })
		await userEvent.click(screen.getByRole('button', { name: UI_FILE_MANAGER.RENAME }))
		const group = screen.getByRole('group', { name: 'Новое имя для «logo.png»' })
		const field = within(group).getByRole('textbox')

		await fireEvent.keyDown(field, { key: 'Enter', keyCode: 229 })
		await fireEvent.keyDown(field, { key: 'Escape', keyCode: 229 })
		expect(emitted('rename')).toBeUndefined()
		expect(group).toBeInTheDocument()

		await fireEvent.keyDown(field, { key: 'Escape', keyCode: 27 })
		expect(screen.queryByRole('group', { name: /Новое имя/ })).not.toBeInTheDocument()
	})
})
