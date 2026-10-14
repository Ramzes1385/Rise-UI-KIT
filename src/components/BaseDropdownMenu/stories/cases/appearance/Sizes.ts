import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDropdownMenu.stories'
import BaseDropdownMenu from '../../../ui/BaseDropdownMenu.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const HIDDEN_ARGS = ['isOpen', 'sizeScale', 'items']

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const items = [
	[
		{ label: 'Копировать', icon: 'copy' },
		{ label: 'Удалить', icon: 'trash' },
	],
]

const template = `
	<div class="story-grid" style="--story-grid-min: 160px;">
		<div v-for="preset in presets" :key="preset.name" style="height: 170px;">
			<BaseDropdownMenu v-bind="args" :items="items" :is-open="true" :size-scale="preset.sizeScale" :aria-label="preset.label">
				<BaseButton variant="outline" :size-scale="preset.sizeScale">{{ preset.label }}</BaseButton>
			</BaseDropdownMenu>
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant'] },
		docs: {
			...docsFrame(240),
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — пункты, иконки и отступы панели.' },
			source: storySource({
				template,
				imports: ['BaseDropdownMenu', 'BaseButton'],
				script: [`const presets = ${literal(presets)}`, `const items = ${literal(items)}`].join('\n'),
				omit: HIDDEN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseDropdownMenu, BaseButton },
		setup: useStorySetup(args, { data: { presets, items }, slots: HIDDEN_ARGS }),
		template,
	}),
}
