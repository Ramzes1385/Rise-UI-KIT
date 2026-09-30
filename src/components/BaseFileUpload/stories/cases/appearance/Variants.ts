import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFileUpload from '../../../ui/BaseFileUpload.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { FILE_UPLOAD_VARIANTS } from '../../../types/BaseFileUpload.types'

const variants = FILE_UPLOAD_VARIANTS

const template = `
	<div class="story-grid" style="--story-grid-min: 220px;">
		<BaseFileUpload v-for="variant in variants" :key="variant" v-bind="args" :variant="variant" :label="variant" />
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		maxWidth: 760,
		controls: { include: ['sizeScale', 'isDisabled', 'error'] },
		docs: {
			description: {
				story: [
					'Варианты зоны: `default` — пунктир; `outline` — сплошная рамка на прозрачном фоне; `soft` — мягкий фон без рамки;',
					'`ghost` — без рамки и фона (для плотных интерфейсов); `shadow` — приподнятая с тенью.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseFileUpload'],
				script: `const variants = ${literal(variants)}`,
				omit: ['variant', 'label'],
			}),
		},
	},
	render: args => ({
		components: { BaseFileUpload },
		setup: useStorySetup(args, { data: { variants }, slots: ['variant', 'label'] }),
		template,
	}),
}
