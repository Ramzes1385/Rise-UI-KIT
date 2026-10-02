import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMapEditor from '../ui/BaseImageMapEditor.vue'

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
} satisfies Meta<typeof BaseImageMapEditor>['parameters']
