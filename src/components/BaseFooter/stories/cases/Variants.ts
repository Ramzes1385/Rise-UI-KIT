import { expect } from 'storybook/test'
import type meta from '../BaseFooter.stories'
import { BaseLink } from '@components/BaseLink'
import BaseFooter from '../../ui/BaseFooter.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { FOOTER_VARIANTS } from '../../types/BaseFooter.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`default` — линия сверху, `soft` — приглушённый фон, `ghost` — прозрачный подвал. Подвалы в `<section>`: на странице',
					'должен быть один ориентир contentinfo.',
				].join('\n'),
			},
		},
		controls: { include: ['sizeScale', 'containerSize'] },
	},
	render: args => ({
		components: { BaseFooter, BaseLink },
		setup: () => ({ props: useArgsWithoutSlots(args, ['variant']), variants: FOOTER_VARIANTS }),
		template: `
			<div class="story-stack" style="gap: 24px">
				<section v-for="variant in variants" :key="variant" :aria-label="'Подвал ' + variant">
					<BaseFooter v-bind="props" :variant="variant">
						<template #start>{{ variant }}</template>
						<BaseLink href="#help">Помощь</BaseLink>
					</BaseFooter>
				</section>
			</div>
		`,
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('.base-footer--soft')).toBeVisible()
	},
}
