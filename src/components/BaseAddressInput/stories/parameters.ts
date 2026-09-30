import type { Meta } from '@storybook/vue3-vite'
import type BaseAddressInput from '../ui/BaseAddressInput.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Адрес с подсказками: BaseAutocomplete с загрузкой вариантов из источника `source`.',
				'',
				'- `source(query, { signal })` возвращает подсказки `{ value, unrestrictedValue?, data? }`. Готовый адаптер —',
				'  `createDadataAddressSource({ token })` для «Подсказок» DaData; можно подключить свой сервер.',
				'- Запрос уходит после паузы `debounce` (300 мс) и с `minChars` знаков (3); устаревший запрос отменяется через',
				'  `AbortSignal`, ошибка сервиса просто оставляет список пустым.',
				'- `v-model` — адрес строкой: выбранная подсказка или свой текст; событие `select` — подсказка со всеми данными',
				'  сервиса (индекс, координаты, ФИАС).',
				'- Клавиатура — как у BaseAutocomplete: стрелки, Enter, Escape. Здесь подсказки — из демо-списка с задержкой 300 мс.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseAddressInput>['parameters']
