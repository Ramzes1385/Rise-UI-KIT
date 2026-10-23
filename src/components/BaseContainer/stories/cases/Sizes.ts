import { expect } from 'storybook/test'
import type meta from '../BaseContainer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseContainer from '../../ui/BaseContainer.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { CONTAINER_SIZES } from '../../types/BaseContainer.types'

const template = `
	<div class="story-stack">
		<BaseContainer v-for="size in CONTAINER_SIZES" :key="size" v-bind="args" :size="size">
			<div style="padding: 16px; border: 1px dashed var(--rise-border-accented); border-radius: 8px">{{ size }}</div>
		</BaseContainer>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все ширины: на экране уже 1280px `xl` и `full` совпадают.' },
			source: storySource({ template, imports: ['BaseContainer', 'CONTAINER_SIZES'], omit: ['size'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseContainer },
		setup: useStorySetup(args, { data: { CONTAINER_SIZES }, slots: ['size'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const small = canvasElement.querySelector('.base-container--sm') as HTMLElement
		await expect(getComputedStyle(small).maxWidth).toBe('640px')
	},
}
