import '@testing-library/jest-dom/vitest'
import { UI_COLOR_PICKER } from '@/locales/messages'
import { render, screen } from '@testing-library/vue'
import BaseColorPicker from '../ui/BaseColorPicker.vue'

describe('BaseColorPicker: имя кнопки-образца', () => {
	it('без ariaLabel — «Выбранный цвет» и значение', () => {
		render(BaseColorPicker, { props: { modelValue: '#ff0000' } })

		expect(screen.getByRole('button', { name: `${UI_COLOR_PICKER.SELECTED_COLOR} #ff0000` })).toBeInTheDocument()
	})

	it('ariaLabel говорит, что выбирает цвет, и сохраняет значение в имени', () => {
		render(BaseColorPicker, { props: { modelValue: '#00ff00', ariaLabel: 'Цвет фона' } })

		expect(screen.getByRole('button', { name: 'Цвет фона, выбран #00ff00' })).toBeInTheDocument()
	})

	it('triggerAttrs попадают на кнопку-образец', () => {
		render({
			components: { BaseColorPicker },
			template: `
				<p id="hint">Для тёмной темы</p>
				<BaseColorPicker model-value="#000000" aria-label="Цвет текста" :trigger-attrs="{ id: 'text-color', 'data-qa': 'text-color', 'aria-describedby': 'hint' }" />
			`,
		})

		const swatch = screen.getByRole('button', { name: 'Цвет текста, выбран #000000' })
		expect(swatch).toHaveAttribute('id', 'text-color')
		expect(swatch).toHaveAttribute('data-qa', 'text-color')
		expect(swatch).toHaveAccessibleDescription('Для тёмной темы')
	})
})
