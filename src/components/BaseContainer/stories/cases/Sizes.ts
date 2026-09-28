import { DEMO_STYLE } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseContainer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseContainer from '../../ui/BaseContainer.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { CONTAINER_SIZES } from '../../types/BaseContainer.types'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Все ширины: на экране уже 1280px `xl` и `full` совпадают.' } },
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseContainer },
		setup: () => ({ props: useArgsWithoutSlots(args, ['size']), sizes: CONTAINER_SIZES, demoStyle: DEMO_STYLE }),
		template: `
			<div class="story-stack">
				<BaseContainer v-for="size in sizes" :key="size" v-bind="props" :size="size">
					<div :style="demoStyle">{{ size }}</div>
				</BaseContainer>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		const small = canvasElement.querySelector('.base-container--sm') as HTMLElement
		await expect(getComputedStyle(small).maxWidth).toBe('640px')
	},
}
