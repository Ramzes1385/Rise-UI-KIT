import type { Meta } from '@storybook/vue3-vite'
import type BaseDatePicker from '../ui/BaseDatePicker.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Поле выбора даты: клик по полю или Enter / ↓ открывает панель с календарём `BaseCalendar`.',
				'',
				'- Режим — `selectionMode`: `single` (`v-model`), `range` (`v-model` + `v-model:model-value-end`),',
				'  `multiple` (`v-model:selected-dates`). Одна дата выбирается одним кликом, и панель закрывается.',
				'- Поле — `BaseInput` (варианты `inputVariant`): подпись связана с полем, ошибка — через `aria-describedby`.',
				'  Ручной ввод выключен (`isReadonly`), кнопка «Очистить» — `isClearable`.',
				'- Панель — диалог в body: ограничения (`minDate`, `maxDate`, `disabledWeekdays`…), время (`showTime`),',
				'  номера недель, несколько месяцев по ширине поля (`isMultiMonth`). Escape и клик снаружи закрывают её,',
				'  фокус возвращается в поле.',
				'',
				'Календарь без поля — `BaseCalendar`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseDatePicker>['parameters']
