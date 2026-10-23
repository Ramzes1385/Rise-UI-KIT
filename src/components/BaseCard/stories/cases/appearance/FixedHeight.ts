import { expect } from 'storybook/test'
import { LONG_BODY } from '../../shared'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const text = LONG_BODY

const template = `
	<div class="story-grid" style="--story-grid-min: 260px; align-items: start;">
		<BaseCard v-bind="args" title="Со scroll" subtitle="Тело прокручивается" height="240px" scroll>{{ text }}</BaseCard>
		<BaseCard v-bind="args" title="Без scroll" subtitle="Текст — три строки" height="240px">{{ text }}</BaseCard>
	</div>
`

export const FixedHeight: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Фиксированная высота `height`. Слева — со `scroll`: тело прокручивается, шапка на месте; тело получает фокус',
					'по Tab, чтобы его можно было прокрутить стрелками. Справа — без `scroll`: текст тела обрезается до трёх строк.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCard'],
				script: `const text = ${literal(text)}`,
				omit: ['default', 'title', 'subtitle', 'height', 'scroll'],
			}),
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: useStorySetup(args, { data: { text }, slots: ['default', 'title', 'subtitle', 'height', 'scroll'] }),
		template,
	}),
	play: async ({ canvasElement, userEvent }) => {
		const [scrolled, truncated] = canvasElement.querySelectorAll<HTMLElement>('.base-card')
		await expect(scrolled.getBoundingClientRect().height).toBe(240)
		const scrolledBody = scrolled.querySelector('.base-card__body') as HTMLElement
		await expect(scrolledBody.scrollHeight).toBeGreaterThan(scrolledBody.clientHeight)
		await tabTo(scrolledBody, userEvent)
		await expect(getComputedStyle(truncated.querySelector('.base-card__body') as HTMLElement).webkitLineClamp).toBe('3')
	},
}
