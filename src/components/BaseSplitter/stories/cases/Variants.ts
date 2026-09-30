import { LETTERS } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseSplitter.stories'
import BaseSplitter from '../../ui/BaseSplitter.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { SPLITTER_VARIANTS } from '../../types/BaseSplitter.types'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const letters = LETTERS

const template = `
	<div class="story-stack">
		<div v-for="variant in SPLITTER_VARIANTS" :key="variant" style="height: 240px; border: 1px solid var(--rise-border); border-radius: 8px; overflow: hidden">
			<BaseSplitter v-bind="args" :variant="variant" :label="'Список писем, ' + variant">
				<template #start>
					<ul aria-label="Письма" style="margin: 0; padding: 12px 16px; list-style: none; display: grid; gap: 8px">
						<li v-for="letter in letters" :key="letter">{{ letter }}</li>
					</ul>
				</template>
				<template #end>
					<article style="padding: 12px 16px">
						<h3 style="margin-top: 0">Счёт за сентябрь</h3>
						<p style="margin: 0">Добрый день! Во вложении счёт за сентябрь, оплата до 10 октября.</p>
					</article>
				</template>
			</BaseSplitter>
		</div>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Варианты: `default` — линия с ручкой, `ghost` — линия появляется при наведении и в фокусе.' },
			source: storySource({
				template,
				imports: ['BaseSplitter', 'SPLITTER_VARIANTS'],
				script: `const letters = ${literal(letters)}`,
				omit: ['variant', 'label'],
			}),
		},
		controls: { include: ['sizeScale', 'orientation'] },
	},
	render: args => ({
		components: { BaseSplitter },
		setup: useStorySetup(args, { data: { SPLITTER_VARIANTS, letters }, slots: ['variant', 'label'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getAllByRole('separator')).toHaveLength(2)
	},
}
