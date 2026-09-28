import type { Meta } from '@storybook/vue3-vite'
import BaseInputTags from '../ui/BaseInputTags.vue'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseInputTags },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
		template: '<div class="story-narrow"><BaseInputTags v-bind="props" @update:model-value="onUpdate" /></div>',
	}
}) satisfies Meta<typeof BaseInputTags>['render']
