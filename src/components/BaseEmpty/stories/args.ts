import type BaseEmpty from '../ui/BaseEmpty.vue'
import type { Meta } from '@storybook/vue3-vite'

export const args = {
	title: 'Задач пока нет',
	description: 'Создайте первую задачу — она появится в этом списке.',
	icon: 'inbox',
	isCompact: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseEmpty>['args']
