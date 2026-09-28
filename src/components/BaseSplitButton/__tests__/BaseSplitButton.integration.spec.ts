import '@testing-library/jest-dom/vitest'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import BaseSplitButton from '../ui/BaseSplitButton.vue'

describe('BaseSplitButton integration', () => {
	it('клик по основной кнопке — click, выбор пункта меню — select', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseSplitButton, { props: { label: 'Сохранить', items: [{ label: 'Сохранить копию' }] } })

		await user.click(screen.getByRole('button', { name: 'Сохранить' }))
		expect(emitted().click).toHaveLength(1)

		await user.click(screen.getByRole('button', { name: 'Другие действия' }))
		await user.click(await screen.findByRole('menuitem', { name: 'Сохранить копию' }))

		expect((emitted().select as unknown[][])[0][0]).toEqual(expect.objectContaining({ label: 'Сохранить копию' }))
	})
})
