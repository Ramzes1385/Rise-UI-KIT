import type { Meta } from '@storybook/vue3-vite'
import type BaseSegmented from '../ui/BaseSegmented.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Переключатель сегментами: выбор одного из двух–пяти коротких вариантов, который сразу меняет вид — период отчёта, вид списка, тариф.',
				'',
				'- Нативные radio с общим `name` (APG Radio Group): один таб-стоп на группу, стрелки переключают выбор.',
				'- Группа — `role="radiogroup"` с именем из `label`, `ariaLabel` или подписи BaseFormField вокруг.',
				'- `isBlock` — во всю ширину, сегменты поровну; у сегмента может быть иконка (`icon`).',
				'',
				'Для длинных подписей и выбора в форме — BaseRadio; для переключения разделов с панелями — BaseTabs.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSegmented>['parameters']
