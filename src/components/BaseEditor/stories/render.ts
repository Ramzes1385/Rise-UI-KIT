import BaseEditor from '../ui/BaseEditor.vue'
import type { Meta } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg()
	return {
		components: { BaseEditor },
		setup: () => ({ props: useArgsWithoutSlots(args, ['toolbar']), onUpdate }),
		template: '<BaseEditor v-bind="props" @update:model-value="onUpdate" />',
	}
}) satisfies Meta<typeof BaseEditor>['render']
