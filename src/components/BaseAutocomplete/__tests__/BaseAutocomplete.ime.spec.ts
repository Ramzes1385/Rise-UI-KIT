import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import BaseAutocomplete from '../ui/BaseAutocomplete.vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import type { AutocompleteOption } from '../types/BaseAutocomplete.types'

const CITIES: AutocompleteOption[] = [
	{ value: 'bj', label: '北京' },
	{ value: 'sh', label: '上海' },
	{ value: 'tk', label: '東京' },
]

const IME_KEYDOWN = [
	['Chrome и Firefox: isComposing', { isComposing: true }],
	['Safari: keyCode 229', { keyCode: 229 }],
] as const

describe('BaseAutocomplete: ввод через IME', () => {
	it.each(IME_KEYDOWN)('%s: стрелки и Enter принадлежат IME, список и значение не меняются', async (_name, init) => {
		const model = ref<string | number | null>(null)
		render({
			components: { BaseAutocomplete },
			setup: () => ({ model, options: CITIES }),
			template: '<BaseAutocomplete v-model="model" :options="options" aria-label="Город" />',
		})
		const field = screen.getByRole('combobox', { name: 'Город' })

		await fireEvent.compositionStart(field)
		await fireEvent.update(field, '北')
		await fireEvent.keyDown(field, { key: 'ArrowDown', ...init })
		expect(field).not.toHaveAttribute('aria-activedescendant')
		await fireEvent.keyDown(field, { key: 'Enter', ...init })
		expect(model.value).toBeNull()
		expect(field).toHaveAttribute('aria-expanded', 'true')

		await fireEvent.compositionEnd(field)
		await fireEvent.keyDown(field, { key: 'ArrowDown', keyCode: 40 })
		await fireEvent.keyDown(field, { key: 'Enter', keyCode: 13 })
		expect(model.value).toBe('bj')
		expect(field).toHaveValue('北京')
	})
})
