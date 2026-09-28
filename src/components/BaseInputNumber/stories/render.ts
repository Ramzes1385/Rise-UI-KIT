import type { Meta } from '@storybook/vue3-vite'
import BaseInputNumber from '../ui/BaseInputNumber.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseInputNumber },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
		template:
			'<div class="story-narrow" style="max-width: 200px;"><BaseInputNumber v-bind="props" @update:model-value="onUpdate" /></div>',
	}
}) satisfies Meta<typeof BaseInputNumber>['render']
