import { expect } from 'storybook/test'
import type meta from '../../BaseCountdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCountdown from '../../../ui/BaseCountdown.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseCountdown v-bind="args" :to="to" />
		<BaseCountdown v-bind="args" :to="to">
			<template #finished><strong>Распродажа закончилась</strong></template>
		</BaseCountdown>
	</div>
`

export const Finished: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Дата уже прошла: нули приглушены, `finish` не вызывается. Слот `finished` заменяет нули своим текстом.',
			},
			source: storySource({ template, imports: ['BaseCountdown'], script: "const to = '2025-01-01T00:00:00+03:00'", omit: ['to'] }),
		},
	},
	render: args => ({
		components: { BaseCountdown },
		setup: useStorySetup(args, { data: { to: '2025-01-01T00:00:00+03:00' }, slots: ['to'] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const [zeros, custom] = canvas.getAllByRole('timer')
		await expect(zeros).toHaveClass('base-countdown--finished')
		await expect(zeros).toHaveTextContent('До конца распродажи: время вышло')
		await expect(custom).toHaveTextContent('Распродажа закончилась')
		await expect(canvasElement.querySelectorAll('.base-countdown__value')).toHaveLength(4)
	},
}
