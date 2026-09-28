import type { Meta } from '@storybook/vue3-vite'
import type BaseCheckboxGroup from '../ui/BaseCheckboxGroup.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Группа флажков — выбор нескольких вариантов из видимого списка: каналы уведомлений, фильтры, права доступа.',
				'',
				'- `v-model` — массив отмеченных значений в порядке вариантов; `options` — `value`, `label`, `isDisabled`.',
				'- Группа — `role="group"` с именем из `label` (или подписи BaseFormField вокруг); ошибка описывает группу.',
				'- `hasSelectAll` — флажок «Выбрать все»: при части отмеченных он с чертой (indeterminate), клик отмечает все доступные.',
				'- Флажки — BaseCheckbox: Tab переходит по ним, пробел отмечает. `variant` получает каждый флажок.',
				'',
				'Для одного флага — `BaseCheckbox` или `BaseSwitch`; для выбора одного варианта — `BaseRadio`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseCheckboxGroup>['parameters']
