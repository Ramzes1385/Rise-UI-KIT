import { expect } from 'storybook/test'
import { TO, TO_SCRIPT } from '../../shared'
import type meta from '../../BaseCountdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCountdown from '../../../ui/BaseCountdown.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseCountdown v-bind="args" :to="to" />
		<BaseCountdown v-bind="args" :to="to" layout="inline" />
		<BaseCountdown v-bind="args" :to="to" layout="inline" :format="['hours', 'minutes', 'seconds']" />
		<BaseCountdown v-bind="args" :to="to" :format="['days', 'hours']" />
	</div>
`

export const Layouts: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ячейки и строка, как часы. Без дней часы идут дальше 24 («53:42:17»), без минут и секунд',
					'младшая единица округляется вверх: 2 дня 5 ч 42 мин → «2 дня 6 часов».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCountdown'], script: TO_SCRIPT, omit: ['to', 'layout', 'format'] }),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseCountdown },
		setup: useStorySetup(args, { data: { to: TO }, slots: ['to', 'layout', 'format'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const clocks = [...canvasElement.querySelectorAll('.base-countdown__clock')].map(clock => clock.textContent ?? '')
		await expect(clocks[0]).toMatch(/^2 дн\. 05:4\d:\d\d$/)
		await expect(clocks[1]).toMatch(/^53:4\d:\d\d$/)
		const last = canvasElement.querySelectorAll('.base-countdown')[3]
		await expect([...last.querySelectorAll('.base-countdown__value')].map(value => value.textContent)).toEqual(['2', '06'])
	},
}
