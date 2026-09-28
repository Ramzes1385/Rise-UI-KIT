import type meta from '../BaseAvatarGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseAvatarGroup from '../../ui/BaseAvatarGroup.vue'
import { AVATAR_GROUP_VARIANTS } from '../../types/BaseAvatarGroup.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Варианты аватаров — как у BaseAvatar.' } },
		controls: { include: ['sizeScale', 'shape'] },
	},
	render: args => ({
		components: { BaseAvatarGroup },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant']), variants: AVATAR_GROUP_VARIANTS }),
		template:
			'<div class="story-stack"><div v-for="variant in variants" :key="variant" class="story-row"><span class="story-label" style="width: 64px;">{{ variant }}</span><BaseAvatarGroup v-bind="props" :variant="variant" /></div></div>',
	}),
}
