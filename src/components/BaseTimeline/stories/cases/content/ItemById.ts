import { ORDER } from '../../shared'
import { expect } from 'storybook/test'
import { BaseBadge } from '@components/BaseBadge'
import type meta from '../../BaseTimeline.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTimeline from '../../../ui/BaseTimeline.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const items = ORDER

const template = `
	<div class="story-narrow">
		<BaseTimeline v-bind="args" :items="items">
			<template #item-shipped="{ item }">
				<strong>{{ item.title }}</strong>
				<p>Трек-номер RU 4410 0925 83</p>
				<BaseBadge variant="soft" label="Курьер в пути" />
			</template>
		</BaseTimeline>
	</div>
`

export const ItemById: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'currentId'] },
		docs: {
			description: {
				story: [
					'Своё содержимое одного события — слот `item-<id>`: здесь `item-shipped` для события `shipped`.',
					'Остальные события — слот `item` или вид по умолчанию.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseBadge', 'BaseTimeline', 'type TimelineItem'],
				script: `const items: TimelineItem[] = ${literal(items)}`,
				omit: ['items'],
			}),
		},
	},
	render: args => ({
		components: { BaseTimeline, BaseBadge },
		setup: useStorySetup(args, { data: { items } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Трек-номер RU 4410 0925 83')).toBeVisible()
		await expect(canvas.queryByText('Курьер привезёт завтра с 10 до 14')).not.toBeInTheDocument()
		await expect(canvas.getByText('Склад в Подольске')).toBeVisible()
	},
}
