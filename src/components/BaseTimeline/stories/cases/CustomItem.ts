import { expect } from 'storybook/test'
import type meta from '../BaseTimeline.stories'
import { BaseBadge } from '@components/BaseBadge'
import BaseTimeline from '../../ui/BaseTimeline.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow">
		<BaseTimeline v-bind="args">
			<template #item="{ item, isCurrent, isUpcoming }">
				<span style="display: flex; align-items: center; gap: 8px;">
					<strong style="font-weight: 500;">{{ item.title }}</strong>
					<BaseBadge v-if="isCurrent" variant="soft" label="Сейчас" />
					<BaseBadge v-else-if="isUpcoming" variant="outline" label="Скоро" />
				</span>
			</template>
		</BaseTimeline>
	</div>
`

export const CustomItem: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Свой слот `item`: статус бейджем рядом с заголовком; маркер и линию рисует лента.' },
			source: storySource({ template, imports: ['BaseBadge', 'BaseTimeline'] }),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseTimeline, BaseBadge },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Сейчас')).toBeVisible()
	},
}
