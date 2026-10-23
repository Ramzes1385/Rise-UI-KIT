import { expect } from 'storybook/test'
import { TO, TO_SCRIPT } from '../../shared'
import type meta from '../../BaseCountdown.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseCountdown from '../../../ui/BaseCountdown.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<BaseCountdown v-bind="args" :to="to" />`

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Свой цвет ячеек и цифр через `color`. Для статусов берите токены ролей: `var(--rise-success-soft)`.' },
			source: storySource({ template, imports: ['BaseCountdown'], script: TO_SCRIPT, omit: ['to'] }),
		},
	},
	args: { color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } } },
	render: args => ({
		components: { BaseCountdown },
		setup: useStorySetup(args, { data: { to: TO }, slots: ['to'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const unit = canvasElement.querySelector('.base-countdown__unit') as HTMLElement
		await expect(getComputedStyle(unit).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(unit.querySelector('.base-countdown__value') as HTMLElement).color).toBe('rgb(255, 255, 255)')
	},
}
