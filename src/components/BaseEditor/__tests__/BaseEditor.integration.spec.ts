/**
 * Integration-тесты для BaseEditor.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render } from '@testing-library/vue'
import BaseEditor from '../ui/BaseEditor.vue'

describe('BaseEditor integration', () => {
	it('должен эмитить update:modelValue при вводе в contenteditable', async () => {
		const { container, emitted } = render(BaseEditor, {
			props: { modelValue: '' },
		})

		const editor = container.querySelector('.base-editor__content')
		if (!editor) throw new Error('Editor not found')

		editor.innerHTML = 'Hello'
		await fireEvent.input(editor)

		expect(emitted()).toHaveProperty('update:modelValue')
		expect(emitted()['update:modelValue'][0]).toEqual(['Hello'])
	})
})
