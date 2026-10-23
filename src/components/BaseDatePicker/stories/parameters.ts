import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseDatePicker from '../ui/BaseDatePicker.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Поле выбора даты: клик по полю или Enter / ↓ открывает панель с календарём `BaseCalendar`.',
				'',
				'- Режим — `selectionMode`: `single` (`v-model`), `range` (`v-model` + `v-model:model-value-end`),',
				'  `multiple` (`v-model:selected-dates`). Одна дата выбирается одним кликом, и панель закрывается.',
				'- Поле — `BaseInput` (варианты `inputVariant`): подпись связана с полем, ошибка — через `aria-describedby`.',
				'  Ручной ввод выключен (`isReadonly`, в режиме `range` его можно включить), кнопка «Очистить» — `isClearable`.',
				'- Панель — диалог в body: ограничения (`minDate`, `maxDate`, `disabledWeekdays`…), время (`showTime`),',
				'  номера недель. Панель — на всю ширину поля; шире одного календаря — два, три и больше месяцев (`isMultiMonth`,',
				'  по умолчанию включён; предел — `maxMonths`, точное число — `monthsShown`). Escape и клик снаружи закрывают её,',
				'  фокус возвращается в поле.',
				'- Диапазон (`range`): готовые периоды `presets`, пределы длины `minDays` и `maxDays`, ввод периода в поле с клавиатуры.',
				'',
				'Календарь без поля — `BaseCalendar`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseDatePicker>['parameters']
