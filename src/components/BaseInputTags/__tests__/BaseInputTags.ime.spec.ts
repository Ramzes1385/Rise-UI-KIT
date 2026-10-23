import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import BaseInputTags from '../ui/BaseInputTags.vue'
import { fireEvent, render, screen } from '@testing-library/vue'

const IME_ENTER = [
	['Chrome и Firefox: isComposing', { isComposing: true }],
	['Safari: compositionend раньше keydown, keyCode 229', { keyCode: 229 }],
] as const

function renderModel() {
	const model = ref<string[]>([])
	render({
		components: { BaseInputTags },
		setup: () => ({ model }),
		template: '<BaseInputTags v-model="model" aria-label="Теги" />',
	})
	return { model, field: screen.getByRole('textbox', { name: 'Теги' }) }
}

describe('BaseInputTags: ввод через IME', () => {
	it.each(IME_ENTER)('%s: Enter подтверждает слово и не добавляет тег, следующий Enter добавляет', async (_name, init) => {
		const { model, field } = renderModel()

		await fireEvent.compositionStart(field)
		await fireEvent.update(field, 'nihao')
		await fireEvent.keyDown(field, { key: 'Enter', ...init })
		expect(model.value).toEqual([])
		expect(field).toHaveValue('nihao')

		await fireEvent.compositionEnd(field)
		await fireEvent.update(field, '你好')
		await fireEvent.keyDown(field, { key: 'Enter', keyCode: 13 })
		expect(model.value).toEqual(['你好'])
		expect(field).toHaveValue('')
	})

	it('Backspace и стрелка влево в начале поля во время композиции не уводят фокус на тег', async () => {
		const model = ref(['日本語'])
		render({ components: { BaseInputTags }, setup: () => ({ model }), template: '<BaseInputTags v-model="model" aria-label="Теги" />' })
		const field = screen.getByRole('textbox', { name: 'Теги' })

		const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', isComposing: true, bubbles: true, cancelable: true })
		field.dispatchEvent(event)

		expect(event.defaultPrevented).toBe(false)
	})
})
