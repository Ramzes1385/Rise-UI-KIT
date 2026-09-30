import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseNotificationCenter.stories'
import BaseNotificationCenter from '../../ui/BaseNotificationCenter.vue'
import { SIZE_PRESETS, sizeLabel, useArgsWithoutSlots } from '@/stories/helpers'

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Размеры через `sizeScale`: 75 / 100 / 125% — шрифты, отступы, аватары и кнопки.' } },
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseNotificationCenter },
		setup: () => ({
			props: useArgsWithoutSlots(args),
			presets: SIZE_PRESETS.filter(preset => [75, 100, 125].includes(preset.sizeScale)),
			sizeLabel,
		}),
		template: `
			<div class="story-row" style="align-items: flex-start">
				<div v-for="preset in presets" :key="preset.name" style="width: 380px">
					<BaseNotificationCenter v-bind="props" :items="props.items.slice(0, 2)" :size-scale="preset.sizeScale" :title="sizeLabel(preset)" />
				</div>
			</div>
		`,
	}),
}
