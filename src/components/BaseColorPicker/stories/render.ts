import { CENTERED } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import BaseColorPicker from '../ui/BaseColorPicker.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseColorPicker },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate, centered: CENTERED }),
		template: '<div :style="centered"><BaseColorPicker v-bind="props" @update:model-value="onUpdate" /></div>',
	}
}) satisfies Meta<typeof BaseColorPicker>['render']
