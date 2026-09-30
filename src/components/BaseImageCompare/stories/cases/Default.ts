import { useModelArg } from '@/stories/helpers'
import { expect, fireEvent } from 'storybook/test'
import type meta from '../BaseImageCompare.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageCompare from '../../ui/BaseImageCompare.vue'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Потяните границу или нажмите Tab и двигайте её стрелками.' } } },
	render: args => {
		const onUpdate = useModelArg('position')
		return {
			components: { BaseImageCompare },
			setup: () => ({ args, onUpdate }),
			template: '<div style="max-width: 560px"><BaseImageCompare v-bind="args" @update:position="onUpdate" /></div>',
		}
	},
	play: async ({ canvas, userEvent }) => {
		const handle = canvas.getByRole('slider', { name: 'Граница между «До» и «После»' })
		await userEvent.tab()
		await expect(handle).toHaveFocus()
		await userEvent.keyboard('{ArrowRight}')
		await expect(handle).toHaveAttribute('aria-valuenow', '51')
		await userEvent.keyboard('{Shift>}{ArrowLeft}{/Shift}')
		await expect(handle).toHaveAttribute('aria-valuetext', '41%')
		await fireEvent.keyDown(handle, { key: 'End' })
		await expect(handle).toHaveAttribute('aria-valuenow', '100')
	},
}
