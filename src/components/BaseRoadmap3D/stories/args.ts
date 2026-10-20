import type { Meta } from '@storybook/vue3-vite'
import type BaseRoadmap3D from '../ui/BaseRoadmap3D.vue'
import { frontendVue, frontendVueProgress } from '@components/BaseRoadmap/stories/demo/frontendVue'

export const args = {
	data: frontendVue,
	progress: frontendVueProgress,
	isDisabled: false,
	isLoading: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseRoadmap3D>['args']
