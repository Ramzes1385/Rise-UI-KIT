import { expect } from 'storybook/test'
import { LONG_BODY } from '../../shared'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, tabTo } from '@/stories/helpers'

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
			source: {
				code: [
					'<BaseCard title="Со scroll" height="240px" scroll>…</BaseCard>',
					'<BaseCard title="Без scroll" height="240px">…</BaseCard>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'title', 'subtitle', 'height', 'scroll']), text: LONG_BODY }),
		template: `
			<div class="story-grid" style="--story-grid-min: 260px; align-items: start;">
				<BaseCard v-bind="props" title="Со scroll" subtitle="Тело прокручивается" height="240px" scroll>{{ text }}</BaseCard>
				<BaseCard v-bind="props" title="Без scroll" subtitle="Текст — три строки" height="240px">{{ text }}</BaseCard>
			</div>
		`,
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
