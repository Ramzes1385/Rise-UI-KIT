import BasePin from '../ui/BasePin.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BasePin },
		setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
		template: '<BasePin v-bind="props" aria-label="Код из СМС" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BasePin>['render']
