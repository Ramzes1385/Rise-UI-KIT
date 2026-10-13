import { MESSAGES } from '../../shared'
import type meta from '../../BaseBanner.stories'
import { expect, waitFor } from 'storybook/test'
import BaseBanner from '../../../ui/BaseBanner.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const paragraphs = Array.from(
	{ length: 10 },
	(_, index) => `Раздел ${index + 1}: описание тарифа, условия подключения и список доступных функций.`,
)

const template = `
	<div tabindex="0" style="height: 240px; overflow: auto;">
		<BaseBanner v-bind="args" />
		<p v-for="paragraph in paragraphs" :key="paragraph" style="margin: 0; padding: 12px 16px;">{{ paragraph }}</p>
	</div>
`

export const Sticky: StoryObj<typeof meta> = {
	args: { type: 'info', variant: 'soft', text: MESSAGES.info, position: 'sticky' },
	parameters: {
		controls: { include: ['type', 'variant', 'isClosable'] },
		docs: {
			description: {
				story: '`position="sticky"`: при прокрутке контейнера объявление остаётся у его верхнего края (в приложении — у верха окна).',
			},
			source: storySource({ template, imports: ['BaseBanner'], script: `const paragraphs = ${literal(paragraphs)}` }),
		},
	},
	render: args => ({
		components: { BaseBanner },
		setup: useStorySetup(args, { data: { paragraphs } }),
		template,
	}),
	play: async ({ canvas }) => {
		const banner = canvas.getByRole('region', { name: 'Объявление' })
		const container = banner.parentElement as HTMLElement
		container.scrollTop = 200
		await waitFor(() => expect(container.scrollTop).toBeGreaterThan(0))
		await waitFor(() => expect(Math.round(banner.getBoundingClientRect().top)).toBe(Math.round(container.getBoundingClientRect().top)))
	},
}
