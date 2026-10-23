import { expect } from 'storybook/test'
import { LONG_BODY } from '../../shared'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow"><BaseCard v-bind="args">{{ slots.default }}</BaseCard></div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Длинные заголовок, подзаголовок и текст переносятся по словам и не выходят за ширину карточки (здесь — 360px).',
			},
			source: storySource({ template, imports: ['BaseCard'] }),
		},
	},
	args: {
		title: 'Итоги квартала по всем проектам отдела маркетинга и продаж',
		subtitle: 'Сводка обновляется автоматически каждый понедельник в 9:00 по московскому времени',
		default: LONG_BODY,
	},
	render: args => ({
		components: { BaseCard },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const title = canvas.getByRole('heading', { level: 3 })
		const card = title.closest('.base-card') as HTMLElement
		await expect(card.getBoundingClientRect().width).toBeLessThanOrEqual(360)
		await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth)
		await expect(title.getBoundingClientRect().height).toBeGreaterThan(24)
	},
}
