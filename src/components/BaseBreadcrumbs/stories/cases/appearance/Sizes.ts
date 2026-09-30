import { SLOT_KEYS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'
import BaseBreadcrumbs from '../../../ui/BaseBreadcrumbs.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-stack">
		<div v-for="preset in presets" :key="preset.name" class="story-col">
			<span class="story-label">{{ preset.label }}</span>
			<BaseBreadcrumbs v-bind="args" :size-scale="preset.sizeScale" :aria-label="'Хлебные крошки: ' + preset.name" />
		</div>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	args: { variant: 'outline' },
	argTypes: { sizeScale: { control: false } },
	parameters: {
		docs: {
			description: {
				story: 'Размеры через `sizeScale`: текст 12–17px, контейнерные варианты — высотой с контрол того же размера (24–40px).',
			},
			source: storySource({
				template,
				imports: ['BaseBreadcrumbs'],
				script: `const presets = ${literal(presets)}`,
				omit: ['linkComponent'],
			}),
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: useStorySetup(args, { data: { presets }, slots: SLOT_KEYS }),
		template,
	}),
}
