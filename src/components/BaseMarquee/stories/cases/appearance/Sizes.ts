import { NEWS } from '../../shared'
import type meta from '../../BaseMarquee.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMarquee from '../../../ui/BaseMarquee.vue'
import { literal, SIZE_PRESETS, sizeLabel, storySource, useStorySetup } from '@/stories/helpers'

const presets = SIZE_PRESETS.map(preset => ({ name: preset.name, sizeScale: preset.sizeScale, label: sizeLabel(preset) }))

const template = `
	<div class="story-col">
		<BaseMarquee v-for="preset in presets" :key="preset.name" v-bind="args" :size-scale="preset.sizeScale" :label="preset.label" :items="news">
			<template #separator>•</template>
		</BaseMarquee>
	</div>
`

export const Sizes: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Размеры через `sizeScale`: 75 / 87.5 / 100 / 112.5 / 125 — текст, отступ `gap` и кнопка паузы.' },
			source: storySource({
				template,
				imports: ['BaseMarquee'],
				script: `const presets = ${literal(presets)}\nconst news = ${literal(NEWS)}`,
			}),
		},
		controls: { include: ['variant'] },
	},
	render: args => ({
		components: { BaseMarquee },
		setup: useStorySetup(args, { data: { presets, news: NEWS } }),
		template,
	}),
}
