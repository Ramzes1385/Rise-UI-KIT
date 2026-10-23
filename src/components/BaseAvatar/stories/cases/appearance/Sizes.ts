import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { CONTENT_ARGS, anna, ivan } from '../../shared'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-row" style="align-items: flex-end;">
		<div v-for="preset in presets" :key="preset.name" class="story-col" style="align-items: center; text-align: center;">
			<BaseAvatar v-bind="args" :size-scale="preset.sizeScale" :name="anna.name" />
			<BaseAvatar v-bind="args" :size-scale="preset.sizeScale" :src="ivan.avatar" :name="ivan.name" />
			<span class="story-label">{{ preset.label }}</span>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'shape', 'isOnline'] },
		docs: {
			description: {
				story: 'Размеры задаются `sizeScale`. Пресеты xs–xl: 24, 28, 32, 36 и 40px — как высота кнопки того же размера.',
			},
			source: storySource({
				template,
				imports: ['BaseAvatar'],
				script: [`const presets = ${literal(presets)}`, `const anna = ${literal(anna)}`, `const ivan = ${literal(ivan)}`].join(
					'\n',
				),
				omit: [...CONTENT_ARGS, 'sizeScale'],
			}),
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { data: { presets, anna, ivan }, slots: [...CONTENT_ARGS, 'sizeScale'] }),
		template,
	}),
}
