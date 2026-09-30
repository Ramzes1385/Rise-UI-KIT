import type meta from '../BaseAvatarGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAvatarGroup from '../../ui/BaseAvatarGroup.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { AVATAR_GROUP_VARIANTS } from '../../types/BaseAvatarGroup.types'

const variants = AVATAR_GROUP_VARIANTS

const template = `
	<div class="story-stack"><div v-for="variant in variants" :key="variant" class="story-row"><span class="story-label" style="width: 64px;">{{ variant }}</span><BaseAvatarGroup v-bind="args" :variant="variant" /></div></div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты аватаров — как у BaseAvatar.' },
			source: storySource({
				template,
				imports: ['BaseAvatarGroup'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant'],
			}),
		},
		controls: { include: ['sizeScale', 'shape'] },
	},
	render: args => ({
		components: { BaseAvatarGroup },
		setup: useStorySetup(args, { data: { variants }, slots: ['variant'] }),
		template,
	}),
}
