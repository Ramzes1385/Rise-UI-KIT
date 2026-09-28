import BaseConfirm from '../ui/BaseConfirm.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg('isOpen')
	return {
		components: { BaseConfirm, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
		template: `
				<BaseButton variant="outline" @click="onUpdate(true)">Опубликовать серию</BaseButton>
				<BaseConfirm v-bind="props" @update:is-open="onUpdate" />
			`,
	}
}) satisfies Meta<typeof BaseConfirm>['render']
