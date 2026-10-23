import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import BaseInplace from '../ui/BaseInplace.vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen } from '@testing-library/vue'

describe('BaseInplace: ввод через IME', () => {
	it.each([
		['Chrome и Firefox: isComposing', { isComposing: true }],
		['Safari: keyCode 229', { keyCode: 229 }],
	] as const)('%s: Enter не сохраняет, Escape не отменяет правку', async (_name, init) => {
		const model = ref('名前')
		const onSave = vi.fn()
		const onCancel = vi.fn()
		render({
			components: { BaseInplace },
			setup: () => ({ model, onSave, onCancel }),
			template: '<BaseInplace v-model="model" label="Проект" @save="onSave" @cancel="onCancel" />',
		})
		await userEvent.click(screen.getByRole('button', { name: 'Проект: 名前' }))
		const field = screen.getByRole('textbox', { name: 'Проект' })

		await fireEvent.compositionStart(field)
		await fireEvent.update(field, 'あたらしい')
		await fireEvent.keyDown(field, { key: 'Enter', ...init })
		await fireEvent.keyDown(field, { key: 'Escape', ...init })
		expect(onSave).not.toHaveBeenCalled()
		expect(onCancel).not.toHaveBeenCalled()
		expect(field).toBeInTheDocument()

		await fireEvent.compositionEnd(field)
		await fireEvent.update(field, '新しい名前')
		await fireEvent.keyDown(field, { key: 'Enter', keyCode: 13 })
		expect(onSave).toHaveBeenCalledWith('新しい名前')
		expect(model.value).toBe('新しい名前')
	})
})
