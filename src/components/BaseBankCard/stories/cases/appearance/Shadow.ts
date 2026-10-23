import { expect } from 'storybook/test'
import type meta from '../../BaseBankCard.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseBankCard from '../../../ui/BaseBankCard.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row">
		<BaseBankCard v-bind="args" variant="default" label="default" />
		<BaseBankCard v-bind="args" variant="shadow" label="shadow" />
	</div>
`

export const Shadow: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Вариант `shadow`: у полной карты появляется тень `--rise-shadow-md` (у компактной строки — `--rise-shadow-sm`). По умолчанию тени нет — карту от фона отделяет её цвет.',
			},
			source: storySource({ template, imports: ['BaseBankCard'] }),
		},
		controls: { include: ['sizeScale', 'isCompact'] },
	},
	render: args => ({
		components: { BaseBankCard },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, shadowed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-bank-card')]
		await expect(shadowed).toHaveClass('base-bank-card--shadow')
		await expect(getComputedStyle(plain).boxShadow).toBe('none')
		await expect(getComputedStyle(shadowed).boxShadow).not.toBe('none')
	},
}
