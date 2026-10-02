import type { Meta } from '@storybook/vue3-vite'
import type BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'

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
} satisfies Meta<typeof BaseCryptoProSign>['parameters']
