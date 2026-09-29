import { expect } from 'storybook/test'
import type meta from '../../BaseSwitch.stories'
import BaseSwitch from '../../../ui/BaseSwitch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Длинная подпись переносится по словам, трек остаётся у первой строки (ширина контейнера 360px).' } },
	},
	args: {
		modelValue: true,
		label: 'Автоматически продлевать подписку в конце периода и списывать оплату с сохранённой карты',
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseSwitch },
			setup: () => ({ props: useArgsWithoutSlots(args), onUpdate }),
			template: '<div class="story-narrow"><BaseSwitch v-bind="props" @update:model-value="onUpdate" /></div>',
		}
	},
	play: async ({ canvasElement }) => {
		const track = canvasElement.querySelector('.base-switch__slider') as HTMLElement
		const content = canvasElement.querySelector('.base-switch__content') as HTMLElement
		await expect(content.getBoundingClientRect().height).toBeGreaterThan(20)
		await expect(Math.round(track.getBoundingClientRect().top)).toBe(Math.round(content.getBoundingClientRect().top))
	},
}
