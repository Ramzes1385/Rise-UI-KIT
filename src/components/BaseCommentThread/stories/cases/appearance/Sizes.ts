import type { StoryObj } from '@storybook/vue3-vite'
import { SAMPLE_COMMENTS } from '../../sampleComments'
import type meta from '../../BaseCommentThread.stories'
import BaseCommentThread from '../../../ui/BaseCommentThread.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const comments = SAMPLE_COMMENTS.slice(1)

const presets = SIZE_PRESETS.filter(preset => [75, 100, 125].includes(preset.sizeScale)).map(preset => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
}))

const template = `
	<div class="story-row" style="align-items: flex-start">
		<div v-for="preset in presets" :key="preset.name" style="width: 360px">
			<BaseCommentThread
				v-bind="args"
				:comments="comments"
				:size-scale="preset.sizeScale"
				:label="'Комментарии, ' + preset.label" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 100 / 125% — текст, аватары, кнопки и поле.' },
			source: storySource({
				template,
				imports: ['BaseCommentThread'],
				script: [`const comments = ${literal(comments)}`, `const presets = ${literal(presets)}`].join('\n'),
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseCommentThread },
		setup: useStorySetup(args, { data: { comments, presets }, slots: [] }),
		template,
	}),
}
