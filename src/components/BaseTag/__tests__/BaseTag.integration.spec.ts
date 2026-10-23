import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import BaseTag from '../ui/BaseTag.vue'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'

describe('BaseTag integration', () => {
	it('выбираемая: Tab, Space и Enter переключают v-model:is-selected', async () => {
		const user = userEvent.setup()
		const isSelected = ref(false)
		render({
			components: { BaseTag },
			setup: () => ({ isSelected }),
			template: '<BaseTag v-model:is-selected="isSelected" label="Vue" is-selectable />',
		})

		await user.tab()
		const tag = screen.getByRole('button', { name: 'Vue' })
		expect(tag).toHaveFocus()

		await user.keyboard(' ')
		expect(isSelected.value).toBe(true)
		expect(tag).toHaveAttribute('aria-pressed', 'true')

		await user.keyboard('{Enter}')
		expect(isSelected.value).toBe(false)
	})

	it('удаляемая: Tab попадает на кнопку удаления, Backspace удаляет', async () => {
		const user = userEvent.setup()
		const onRemove = vi.fn()
		render(BaseTag, { props: { label: 'Vue', isRemovable: true, onRemove } })

		await user.tab()
		expect(screen.getByRole('button', { name: 'Удалить метку Vue' })).toHaveFocus()

		await user.keyboard('{Backspace}')
		expect(onRemove).toHaveBeenCalledTimes(1)
	})

	it('выбираемая и удаляемая — одна остановка Tab, Delete удаляет', async () => {
		const user = userEvent.setup()
		const onRemove = vi.fn()
		render({
			components: { BaseTag },
			setup: () => ({ onRemove }),
			template: '<div><BaseTag label="Vue" is-selectable is-removable @remove="onRemove" /><button>после</button></div>',
		})

		await user.tab()
		expect(screen.getByRole('button', { name: 'Vue' })).toHaveFocus()
		await user.tab()
		expect(screen.getByRole('button', { name: 'после' })).toHaveFocus()

		await user.tab({ shift: true })
		await user.keyboard('{Delete}')
		expect(onRemove).toHaveBeenCalledTimes(1)
	})
})
