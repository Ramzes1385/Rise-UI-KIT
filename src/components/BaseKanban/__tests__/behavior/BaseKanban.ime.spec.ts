import '@testing-library/jest-dom/vitest'
import { config } from '@vue/test-utils'
import BaseKanban from '../../ui/BaseKanban.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

config.global.stubs = { ...config.global.stubs, 'transition-group': false }

describe('BaseKanban: ввод названия карточки через IME', () => {
	it('Safari: Enter и Escape с keyCode 229 не добавляют карточку и не закрывают поле', async () => {
		const { emitted } = render(BaseKanban, {
			props: {
				columns: [{ id: 'todo', title: '未着手' }],
				cards: [],
				isEditable: true,
				createCardId: () => 'new',
			},
		})
		await fireEvent.click(screen.getByRole('button', { name: 'Добавить карточку' }))
		const field = screen.getByRole('textbox')

		await fireEvent.update(field, 'あたらしい')
		await fireEvent.keyDown(field, { key: 'Enter', keyCode: 229 })
		await fireEvent.keyDown(field, { key: 'Escape', keyCode: 229 })
		expect(emitted('create')).toBeUndefined()
		expect(field).toBeInTheDocument()

		await fireEvent.keyDown(field, { key: 'Enter', keyCode: 13 })
		expect(emitted('create')).toEqual([[{ id: 'new', columnId: 'todo', title: 'あたらしい' }]])
	})
})
