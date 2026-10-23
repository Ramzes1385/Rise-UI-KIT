import { expect } from 'storybook/test'
import type meta from '../BaseHeader.stories'
import BaseHeader from '../../ui/BaseHeader.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { HEADER_VARIANTS } from '../../types/BaseHeader.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack" style="gap: 24px">
		<section v-for="variant in HEADER_VARIANTS" :key="variant" :aria-label="'Шапка ' + variant">
			<BaseHeader v-bind="args" :variant="variant" :title="variant" :is-sticky="false" />
		</section>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`default` — линия снизу, `soft` — приглушённый фон, `ghost` — прозрачная шапка. Шапки в `<section>`: на странице',
					'должен быть один ориентир banner.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseHeader', 'HEADER_VARIANTS'], omit: ['variant', 'title', 'isSticky'] }),
		},
		controls: { include: ['sizeScale', 'containerSize'] },
	},
	render: args => ({
		components: { BaseHeader },
		setup: useStorySetup(args, { data: { HEADER_VARIANTS }, slots: ['variant', 'title', 'isSticky'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelectorAll('header')).toHaveLength(3)
	},
}
