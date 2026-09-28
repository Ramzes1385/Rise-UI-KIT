import type { Meta } from '@storybook/vue3-vite'
import type BaseSelect from '../ui/BaseSelect.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Выбор одного или нескольких значений из списка. Триггер выглядит как поле `BaseInput` (32px),',
				'список — панель `BaseDropdown` в body.',
				'',
				'- `v-model` — значение опции; при `isMultiple` — массив значений, выбранные показаны бейджами.',
				'- `isSearchable` — поле поиска в панели: фокус переходит в него при открытии, стрелки и Enter управляют списком.',
				'- Доступность: триггер — `combobox` с подписью (`label`), список — `listbox`; стрелки, Home/End, Enter/Space,',
				'  Escape; ошибка помечает триггер `aria-invalid` и связана с ним через `aria-describedby`.',
				'',
				'Для свободного ввода с подсказками используйте `BaseSearch`, для 2–5 вариантов на виду — `BaseRadio`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSelect>['parameters']
