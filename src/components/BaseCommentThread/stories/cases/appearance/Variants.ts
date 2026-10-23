import type { StoryObj } from '@storybook/vue3-vite'
import { SAMPLE_COMMENTS } from '../../sampleComments'
import type meta from '../../BaseCommentThread.stories'
import BaseCommentThread from '../../../ui/BaseCommentThread.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import { COMMENT_THREAD_VARIANTS } from '../../../types/BaseCommentThread.types'

const comments = SAMPLE_COMMENTS.slice(1)

const template = `
	<div class="story-row" style="align-items: flex-start">
		<div v-for="variant in COMMENT_THREAD_VARIANTS" :key="variant" style="width: 420px">
			<BaseCommentThread v-bind="args" :comments="comments" :variant="variant" :label="'Вариант ' + variant" />
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты: default — панель с рамкой, ghost — без рамки и отступов, внутри карточки или страницы.' },
			source: storySource({
				template,
				imports: ['BaseCommentThread', 'COMMENT_THREAD_VARIANTS'],
				script: `const comments = ${literal(comments)}`,
			}),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseCommentThread },
		setup: useStorySetup(args, { data: { comments, COMMENT_THREAD_VARIANTS }, slots: [] }),
		template,
	}),
}
