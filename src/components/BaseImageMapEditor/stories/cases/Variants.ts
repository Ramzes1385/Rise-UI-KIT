import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseImageMapEditor.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseImageMapEditor from '../../ui/BaseImageMapEditor.vue'
import { IMAGE_MAP_EDITOR_VARIANTS } from '../../types/BaseImageMapEditor.types'

const template = `<div class="story-stack"><BaseImageMapEditor v-for="variant in IMAGE_MAP_EDITOR_VARIANTS" :key="variant" v-bind="args" :variant="variant" :label="'Редактор карты: ' + variant" /></div>`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Варианты оформления на пустом редакторе: `default` — рамка и фон, `outline` — заметная рамка, `ghost` — без рамки, редактор встроен в страницу.',
			},
			source: storySource({ template, imports: ['BaseImageMapEditor', 'IMAGE_MAP_EDITOR_VARIANTS'] }),
		},
		controls: { include: ['sizeScale', 'isDisabled'] },
	},
	args: { modelValue: undefined },
	render: args => ({
		components: { BaseImageMapEditor },
		setup: useStorySetup(args, { data: { IMAGE_MAP_EDITOR_VARIANTS } }),
		template,
	}),
}
