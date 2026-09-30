import { expect } from 'storybook/test'
import type meta from '../../BaseSwitch.stories'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { enabled: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseSwitch v-bind="args" v-model="enabled" /></div>
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Длинная подпись переносится по словам, трек остаётся у первой строки (ширина контейнера 360px).' },
			source: storySource({ template, imports: ['BaseSwitch'], models }),
		},
	},
	args: {
		modelValue: true,
		label: 'Автоматически продлевать подписку в конце периода и списывать оплату с сохранённой карты',
	},
	render: args => ({
		components: { BaseSwitch },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const track = canvasElement.querySelector('.base-switch__slider') as HTMLElement
		const content = canvasElement.querySelector('.base-switch__content') as HTMLElement
		await expect(content.getBoundingClientRect().height).toBeGreaterThan(20)
		await expect(Math.round(track.getBoundingClientRect().top)).toBe(Math.round(content.getBoundingClientRect().top))
	},
}
