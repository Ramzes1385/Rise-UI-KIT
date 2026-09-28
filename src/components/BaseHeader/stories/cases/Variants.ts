import { expect } from 'storybook/test'
import type meta from '../BaseHeader.stories'
import BaseHeader from '../../ui/BaseHeader.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { HEADER_VARIANTS } from '../../types/BaseHeader.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`default` — линия снизу, `soft` — приглушённый фон, `ghost` — прозрачная шапка. Шапки в `<section>`: на странице',
					'должен быть один ориентир banner.',
				].join('\n'),
			},
		},
		controls: { include: ['sizeScale', 'containerSize'] },
	},
	render: args => ({
		components: { BaseHeader },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant', 'title', 'isSticky']), variants: HEADER_VARIANTS }),
		template: `
			<div class="story-stack" style="gap: 24px">
				<section v-for="variant in variants" :key="variant" :aria-label="'Шапка ' + variant">
					<BaseHeader v-bind="props" :variant="variant" :title="variant" :is-sticky="false" />
				</section>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelectorAll('header')).toHaveLength(3)
	},
}
