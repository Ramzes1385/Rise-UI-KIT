import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMapEditor from '../ui/BaseImageMapEditor.vue'
import { IMAGE_MAP_HOTSPOTS } from '@components/BaseImageMap/stories/fixtures'

export const args = {
	modelValue: IMAGE_MAP_HOTSPOTS,
	label: 'Редактор карты',
	isDisabled: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseImageMapEditor>['args']
