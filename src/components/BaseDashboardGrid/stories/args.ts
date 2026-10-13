import { fn } from 'storybook/test'
import { WIDGET_LAYOUT } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseDashboardGrid from '../ui/BaseDashboardGrid.vue'

export const args = {
	layout: WIDGET_LAYOUT,
	cols: 12,
	rowHeight: 80,
	gap: 16,
	compactType: 'vertical',
	isEditable: false,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:layout': fn(),
	'onUpdate:layouts': fn(),
	onChange: fn(),
} satisfies Meta<typeof BaseDashboardGrid>['args']
