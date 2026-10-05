import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCalendar from '../ui/BaseCalendar.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Календарь для выбора даты, диапазона или нескольких дат — при необходимости со временем.',
				'',
				'- Режим — `selectionMode`: `single` (`v-model`), `range` (`v-model` + `v-model:model-value-end`, событие',
				'  `range-select`), `multiple` (`v-model:selected-dates`).',
				'- Настройки сгруппированы: `constraints` — недоступные даты, `timeConfig` — блок времени (24/12 ч, секунды,',
				'  `v-model:is-am`), `displayConfig` — навигация, смена вида, «Сегодня», год, номера недель.',
				'- Заголовок переключает вид: дни → месяцы → годы. Дни — кнопки с полной датой в имени; выбранные помечены',
				'  `aria-pressed`, сегодняшний день — `aria-current="date"`.',
				'- `highlights` ставит точки-события под датами, `weekends` выделяет выходные и праздники, `showDatePopover`',
				'  показывает дату и события дня по клику.',
				'- Перекраска — токены `--rise-calendar-*`, классы частей — проп `ui` (история «Токены»); смена месяца — сдвиг сетки',
				'  по направлению, смена вида — перекрёстное появление на токенах движения (история «Анимации»).',
				'',
				'Поле с выпадающим календарём — `BaseDatePicker`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseCalendar>['parameters']
