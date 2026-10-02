import type BaseCode from '../ui/BaseCode.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'TODO(scaffold): назначение компонента и когда его использовать.',
				'',
				'- Варианты, размеры при `sizeScale` = 100, доступность.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseCode>['parameters']
