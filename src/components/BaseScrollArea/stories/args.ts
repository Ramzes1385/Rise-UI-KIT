import type { Meta } from '@storybook/vue3-vite'
import type BaseScrollArea from '../ui/BaseScrollArea.vue'

export const args = {
	orientation: 'vertical',
	maxHeight: 220,
	scrollbar: 'hover',
	ariaLabel: 'Журнал склада',
	sizeScale: 100,
} satisfies Meta<typeof BaseScrollArea>['args']
