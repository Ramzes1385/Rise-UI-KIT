import type meta from '../BaseCommentThread.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseCommentThread from '../../ui/BaseCommentThread.vue'
import { COMMENT_THREAD_VARIANTS } from '../../types/BaseCommentThread.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты: default — панель с рамкой, ghost — без рамки и отступов, внутри карточки или страницы.' },
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseCommentThread },
		setup: () => ({ props: useArgsWithoutSlots(args), variants: COMMENT_THREAD_VARIANTS }),
		template: `
			<div class="story-row" style="align-items: flex-start">
				<div v-for="variant in variants" :key="variant" style="width: 420px">
					<BaseCommentThread v-bind="props" :comments="props.comments.slice(1)" :variant="variant" :label="'Вариант ' + variant" />
				</div>
			</div>
		`,
	}),
}
