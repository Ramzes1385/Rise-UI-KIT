import { DEMO_TOOLBAR } from './shared'
import BaseTour from '../ui/BaseTour.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onOpen = useModelArg('isOpen')
	const onStep = useModelArg('step')
	return {
		components: { BaseTour, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []), onOpen, onStep }),
		template: `
				<div class="story-stack">
					${DEMO_TOOLBAR}
					<div>
						<BaseButton variant="soft" @click="onOpen(true)">Запустить тур</BaseButton>
					</div>
				</div>
				<BaseTour v-bind="props" @update:is-open="onOpen" @update:step="onStep" />
			`,
	}
}) satisfies Meta<typeof BaseTour>['render']
