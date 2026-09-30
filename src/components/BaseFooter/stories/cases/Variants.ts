import { expect } from 'storybook/test'
import type meta from '../BaseFooter.stories'
import { BaseLink } from '@components/BaseLink'
import BaseFooter from '../../ui/BaseFooter.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { FOOTER_VARIANTS } from '../../types/BaseFooter.types'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack" style="gap: 24px">
		<section v-for="variant in FOOTER_VARIANTS" :key="variant" :aria-label="'Подвал ' + variant">
			<BaseFooter v-bind="args" :variant="variant">
				<template #start>{{ variant }}</template>
				<BaseLink href="#help">Помощь</BaseLink>
			</BaseFooter>
		</section>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`default` — линия сверху, `soft` — приглушённый фон, `ghost` — прозрачный подвал. Подвалы в `<section>`: на странице',
					'должен быть один ориентир contentinfo.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFooter', 'BaseLink', 'FOOTER_VARIANTS'], omit: ['variant'] }),
		},
		controls: { include: ['sizeScale', 'containerSize'] },
	},
	render: args => ({
		components: { BaseFooter, BaseLink },
		setup: useStorySetup(args, { data: { FOOTER_VARIANTS }, slots: ['variant'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('.base-footer--soft')).toBeVisible()
	},
}
