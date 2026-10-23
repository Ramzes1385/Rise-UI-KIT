import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMapEditor from '../ui/BaseImageMapEditor.vue'
import { IMAGE_MAP_HOTSPOTS } from '@components/BaseImageMap/stories/fixtures'

export const args = {
	modelValue: IMAGE_MAP_HOTSPOTS,
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
	'onUpdate:selected': fn(),
	'onUpdate:tool': fn(),
	'onUpdate:layer': fn(),
	'onImport-error': fn(),
} satisfies Meta<typeof BaseImageMapEditor>['args']
