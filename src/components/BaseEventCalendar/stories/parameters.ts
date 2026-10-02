import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseEventCalendar from '../ui/BaseEventCalendar.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Календарь событий: месяц, неделя, день и список (повестка) — для расписаний, бронирований, планов команды.',
				'Выбрать дату или диапазон в поле — `BaseCalendar` и `BaseDatePicker`.',
				'',
				'- Вид и дата — `v-model:view` и `v-model:date`; панель: «Сегодня», ← →, заголовок периода, переключатель видов',
				'  (`views`; один вид — без переключателя). Событие `period-change` (`{ view, start, end }`) приходит при монтировании',
				'  и после каждой смены периода — по нему приложение загружает события.',
				'- `events` — `{ id, title, start, end?, allDay?, color?, category?, rrule?, exdates? }`; `end` не входит в событие',
				'  (как DTEND в iCalendar). Повторы — подмножество RRULE, разворачиваются только в показанном периоде.',
				'- Месяц: многодневные полосы, «+N ещё» с поповером при `maxEventsPerDay`. Неделя и день: сетка времени с шагом',
				'  `slotDuration`, пересекающиеся события колонками, рабочие часы `workHours`, линия «Сейчас» (`hasNowIndicator`).',
				'- Первый день недели, названия и форматы дат — из языка кита (переключатель «Язык» на панели), `firstDayOfWeek`',
				'  задаёт день вручную.',
				'- Доступность: сетка месяца — APG Grid с одной точкой Tab (стрелки, Home/End, PageUp/PageDown, Shift+PageUp/PageDown —',
				'  год); событие — кнопка с полным именем («Встреча, 2 октября, 10:00–11:00»); смена вида и периода озвучивается',
				'  через `role="status"`.',
				'- Слоты: `toolbar`, `day` и `day-<ГГГГ-ММ-ДД>`, `event`, `event-<id>`, `category-<категория>`, `time-slot`,',
				'  `header-day`, `all-day`, `empty` — пример в истории «Dynamic Slots».',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseEventCalendar>['parameters']
