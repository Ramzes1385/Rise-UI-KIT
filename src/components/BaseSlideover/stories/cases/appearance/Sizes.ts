import { BaseText } from '@components/BaseText'
import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BaseSlideover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseSlideover from '../../../ui/BaseSlideover.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.filter(preset => ['sm', 'md', 'lg'].includes(preset.name)).map(preset => ({
	name: preset.name,
	sizeScale: preset.sizeScale,
	label: sizeLabel(preset),
}))

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'sizeScale']

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name" class="story-frame" style="height: 170px;">
			<BaseSlideover v-bind="args" :is-open="true" is-contained :size-scale="preset.sizeScale" :title="preset.label">
				<BaseText>Содержимое панели.</BaseText>
			</BaseSlideover>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['side'] },
		docs: {
			description: { story: 'Размеры через `sizeScale`: пропорционально меняются отступы, кегль, кнопка закрытия и ширина панели.' },
			source: storySource({
				template,
				imports: ['BaseSlideover', 'BaseText'],
				script: `const presets = ${literal(presets)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseSlideover, BaseText },
		setup: useStorySetup(args, { data: { presets }, slots: OWN_ARGS }),
		template,
	}),
}
