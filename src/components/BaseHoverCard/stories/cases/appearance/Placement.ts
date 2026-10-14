import { BaseText } from '@components/BaseText'
import type meta from '../../BaseHoverCard.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import BaseHoverCard from '../../../ui/BaseHoverCard.vue'
import { panelOf, SHOWCASE_OWN_ARGS } from '../../shared'
import { literal, storySource, useStorySetup, docsFrame } from '@/stories/helpers'

const cells = [
	{ position: 'top', text: 'Карточка сверху', padding: '96px 0 0 64px' },
	{ position: 'bottom', text: 'Карточка снизу', padding: '0 0 96px 64px' },
	{ position: 'left', text: 'Карточка слева', padding: '16px 0 16px 220px' },
	{ position: 'right', text: 'Карточка справа', padding: '16px 0 16px 16px' },
] as const

const OWN_ARGS = [...SHOWCASE_OWN_ARGS, 'position']

const template = `
	<div class="story-grid" style="--story-grid-min: 360px;">
		<div v-for="cell in cells" :key="cell.position" :style="{ padding: cell.padding }">
			<BaseHoverCard v-bind="args" :is-open="true" :position="cell.position">
				<template #trigger>
					<BaseButton variant="outline">{{ cell.position }}</BaseButton>
				</template>
				<BaseText>{{ cell.text }}</BaseText>
			</BaseHoverCard>
		</div>
	</div>
`

export const Placement: StoryObj<typeof meta> = {
	parameters: {
		layout: 'padded',
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			...docsFrame(340),
			description: {
				story: 'Сторона `position`: `top`, `bottom`, `left`, `right` — карточка и стрелка центрируются по триггеру. Есть и выравнивание по краю: `bottom-start`, `top-end`, `left-start`… У края окна карточка переворачивается на другую сторону и сдвигается, чтобы поместиться.',
			},
			source: storySource({
				template,
				imports: ['BaseHoverCard', 'BaseButton', 'BaseText'],
				script: `const cells = ${literal(cells)} as const`,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseHoverCard, BaseButton, BaseText },
		setup: useStorySetup(args, { data: { cells }, slots: OWN_ARGS }),
		template,
	}),
	play: async () => {
		const [top, bottom, left, right] = await Promise.all(cells.map(cell => panelOf(cell.text)))
		const trigger = (position: string) => screen.getByRole('button', { name: position }).getBoundingClientRect()
		await waitFor(() => expect(top.getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger('top').top))
		await waitFor(() => expect(bottom.getBoundingClientRect().top).toBeGreaterThanOrEqual(trigger('bottom').bottom))
		await waitFor(() => expect(left.getBoundingClientRect().right).toBeLessThanOrEqual(trigger('left').left))
		await waitFor(() => expect(right.getBoundingClientRect().left).toBeGreaterThanOrEqual(trigger('right').right))
	},
}
