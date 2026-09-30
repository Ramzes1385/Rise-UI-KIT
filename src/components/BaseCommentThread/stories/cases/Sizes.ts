import type meta from '../BaseCommentThread.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCommentThread from '../../ui/BaseCommentThread.vue'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 100 / 125% — текст, аватары, кнопки и поле.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseCommentThread },
		setup: () => ({
			props: useArgsWithoutSlots(args),
			presets: SIZE_PRESETS.filter(preset => [75, 100, 125].includes(preset.sizeScale)),
			sizeLabel,
		}),
		template: `
			<div class="story-row" style="align-items: flex-start">
				<div v-for="preset in presets" :key="preset.name" style="width: 360px">
					<BaseCommentThread
						v-bind="props"
						:comments="props.comments.slice(1)"
						:size-scale="preset.sizeScale"
						:label="'Комментарии, ' + sizeLabel(preset)" />
				</div>
			</div>
		`,
	}),
}
