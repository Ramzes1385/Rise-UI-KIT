import type { Meta } from '@storybook/vue3-vite'
import type BaseTimePicker from '../ui/BaseTimePicker.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Поле времени: список времени с шагом `step` (по умолчанию 30 минут) и свободный ввод.',
				'',
				'- Построено на BaseAutocomplete (APG Combobox): ↓/↑ по списку, Enter выбирает, ввод фильтрует список по началу времени.',
				'- Набранное «930», «9:30», «9.30» при выходе из поля или Enter становится 09:30; время вне `minTime`–`maxTime` и не время не принимаются.',
				'- Значение — строка `HH:MM` или `null`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseTimePicker>['parameters']
