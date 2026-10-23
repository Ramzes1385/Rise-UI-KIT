import { expect } from 'storybook/test'
import type meta from '../../BaseButton.stories'
import BaseButton from '../../../ui/BaseButton.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, resolveColor, storySource, useStorySetup } from '@/stories/helpers'

const variants = ['default', 'soft', 'tonal', 'outline', 'ghost', 'shadow']

const template = `
	<div class="story-row">
		<BaseButton v-for="variant in variants" :key="variant" v-bind="args" :variant="variant">{{ variant }}</BaseButton>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	argTypes: { variant: { control: false } },
	parameters: {
		docs: {
			description: {
				story: [
					'Шесть вариантов оформления. `default` — заливка основного цвета; `soft` — мягкий тон основного цвета; `tonal` — нейтральная заливка',
					'для вторичных действий («Отмена», «Позже», панели инструментов); `outline` — прозрачная с рамкой; `ghost` — без фона до наведения;',
					'`shadow` — с тенью. Остальные props из Controls (размер, состояния) применяются ко всем кнопкам.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseButton'], script: `const variants = ${literal(variants)}`, omit: ['variant'] }),
		},
	},
	render: args => ({
		components: { BaseButton },
		setup: useStorySetup(args, { data: { variants } }),
		template,
	}),
	play: async ({ canvas }) => {
		const tonal = canvas.getByRole('button', { name: 'tonal' })
		await expect(canvas.getAllByRole('button')).toHaveLength(variants.length)
		await expect(getComputedStyle(tonal).backgroundColor).not.toBe(
			getComputedStyle(canvas.getByRole('button', { name: 'default' })).backgroundColor,
		)
		if (!isStoryBranded()) await expect(getComputedStyle(tonal).backgroundColor).toBe(resolveColor('var(--rise-bg-elevated)'))
	},
}
