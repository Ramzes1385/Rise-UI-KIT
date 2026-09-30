import type { Meta } from '@storybook/vue3-vite'
import type BaseFilterBuilder from '../ui/BaseFilterBuilder.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Конструктор фильтров: условия «поле — сравнение — значение» и связка «все условия» или «любое из условий».',
				'',
				'- `fields` — поля с типом: `text`, `number`, `date`, `select` (с `options`), `boolean`. От типа зависят сравнения',
				'  (содержит, равно, больше, в диапазоне, раньше, заполнено…) и поле значения.',
				'- `v-model` — фильтр `{ match, conditions }`. Строки данных отбирает `createFilterPredicate(фильтр, поля)`:',
				'  подходит для BaseTable, списка или `filter` у BaseKanban. Незаполненные условия не учитываются.',
				'- Текст сравнивается без учёта регистра и «ё», даты — в формате `ГГГГ-ММ-ДД`.',
				'- Каждое условие — группа «Условие N» с полями «Поле», «Сравнение», «Значение»; после добавления фокус',
				'  переходит в новое условие, после удаления — в соседнее.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseFilterBuilder>['parameters']
