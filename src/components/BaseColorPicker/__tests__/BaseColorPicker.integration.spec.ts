/**
 * Integration-тесты для BaseColorPicker.
 * Проверяют v-model в составе родителя: пресет обновляет модель,
 * внешнее изменение модели отражается на swatch.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, ref } from 'vue'
import { UI_COLOR_PICKER } from '@/locales/messages'
import { DEFAULT_COLOR_PRESETS } from '../model/BaseColorPicker.types'
import BaseColorPicker from '../ui/BaseColorPicker.vue'

const Host = defineComponent({
	components: { BaseColorPicker },
	setup() {
		const color = ref('#ff0000')
		function setExternal(): void {
			color.value = '#0000ff'
		}
		return { color, setExternal }
	},
	template: `
		<div>
			<BaseColorPicker v-model="color" />
			<button type="button" data-testid="external" @click="setExternal">Внешнее</button>
			<span data-testid="value">{{ color }}</span>
		</div>
	`,
})

afterEach(() => {
	document.body.querySelectorAll('.base-dropdown__panel').forEach(element => element.remove())
})

describe('BaseColorPicker — integration', () => {
	it('обновляет модель родителя при выборе пресета', async () => {
		const { container, getByTestId } = render(Host)
		await fireEvent.click(container.querySelector('.base-color-picker__swatch')!)
		const preset = document.body.querySelector('.base-color-picker__preset')
		if (!preset) throw new Error('Пресет не найден')
		await fireEvent.click(preset)
		expect(getByTestId('value').textContent).not.toBe('#ff0000')
	})

	it('записывает в модель родителя точный HEX выбранного пресета', async () => {
		const { container, getByTestId } = render(Host)
		await fireEvent.click(container.querySelector('.base-color-picker__swatch')!)
		const [preset] = DEFAULT_COLOR_PRESETS
		await fireEvent.click(screen.getByRole('button', { name: `${UI_COLOR_PICKER.PRESET} ${preset}` }))
		expect(getByTestId('value').textContent).toBe(preset)
		expect(container.querySelector<HTMLElement>('.base-color-picker__swatch')?.style.backgroundColor).toBe(
			'rgb(249, 115, 22)',
		)
	})

	it('отражает внешнее изменение модели на swatch', async () => {
		const { container, getByTestId } = render(Host)
		await fireEvent.click(getByTestId('external'))
		const swatch = container.querySelector<HTMLElement>('.base-color-picker__swatch')
		expect(swatch?.style.backgroundColor).toBe('rgb(0, 0, 255)')
	})
})
