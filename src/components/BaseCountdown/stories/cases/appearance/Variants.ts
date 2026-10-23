import { TO, TO_SCRIPT } from '../../shared'
import type meta from '../../BaseCountdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCountdown from '../../../ui/BaseCountdown.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { COUNTDOWN_VARIANTS } from '../../../types/BaseCountdown.types'

const template = `<div class="story-stack"><BaseCountdown v-for="variant in COUNTDOWN_VARIANTS" :key="variant" v-bind="args" :to="to" :variant="variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Вид ячеек: с рамкой, на приглушённом фоне, заметная рамка и только цифры (`ghost`).' },
			source: storySource({ template, imports: ['BaseCountdown', 'COUNTDOWN_VARIANTS'], script: TO_SCRIPT, omit: ['to'] }),
		},
		controls: { include: ['sizeScale', 'format'] },
	},
	render: args => ({
		components: { BaseCountdown },
		setup: useStorySetup(args, { data: { COUNTDOWN_VARIANTS, to: TO }, slots: ['to'] }),
		template,
	}),
}
