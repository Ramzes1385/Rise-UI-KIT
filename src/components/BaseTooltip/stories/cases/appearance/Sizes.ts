import type meta from '../../BaseTooltip.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTooltip from '../../../ui/BaseTooltip.vue'
import { docsFrame, literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const OWN_ARGS = ['sizeScale', 'text']

const template = `
	<div class="story-row" style="gap: 40px;">
		<BaseTooltip v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :text="preset.label">
			<BaseButton variant="outline">{{ preset.name }}</BaseButton>
		</BaseTooltip>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	args: { isAlwaysVisible: true },
	parameters: {
		controls: { include: ['variant', 'position'] },
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: пропорционально меняются кегль, отступы, радиус и стрелка подсказки; кнопка — нет.',
			},
			...docsFrame(140),
			source: storySource({
				template,
				imports: ['BaseTooltip', 'BaseButton'],
				script: `const presets = ${literal(presets)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: useStorySetup(args, { data: { presets }, slots: OWN_ARGS }),
		template,
	}),
}
