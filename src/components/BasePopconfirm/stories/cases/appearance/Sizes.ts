import { BaseButton } from '@components/BaseButton'
import type meta from '../../BasePopconfirm.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopconfirm from '../../../ui/BasePopconfirm.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const OWN_ARGS = ['isOpen', 'sizeScale', 'description', 'position']

const template = `
	<div class="story-grid" style="--story-grid-min: 320px; padding-top: 140px;">
		<div v-for="preset in presets" :key="preset.name" style="height: 180px;">
			<BasePopconfirm v-bind="args" :is-open="true" :size-scale="preset.sizeScale" position="top" :title="preset.label">
				<BaseButton variant="outline" :size-scale="preset.sizeScale">{{ preset.label }}</BaseButton>
			</BasePopconfirm>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		layout: 'padded',
		controls: { include: ['variant'] },
		docs: {
			...docsFrame(300),
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — текст, отступы и кнопки панели.' },
			source: storySource({
				template,
				imports: ['BasePopconfirm', 'BaseButton'],
				script: `const presets = ${literal(presets)}`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BasePopconfirm, BaseButton },
		setup: useStorySetup(args, { data: { presets }, slots: OWN_ARGS }),
		template,
	}),
}
