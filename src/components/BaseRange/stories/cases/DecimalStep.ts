import { ref } from 'vue'
import type meta from '../BaseRange.stories'
import BaseRange from '../../ui/BaseRange.vue'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, tabTo } from '@/stories/helpers'

export const DecimalStep: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Дробный шаг: значения кратны 0.1 без хвостов плавающей точки (0.3, а не 0.30000000000000004).' } },
	},
	args: { modelValue: 0.5, min: 0, max: 1, step: 0.1, ariaLabel: 'Прозрачность', hasLabel: true },
	render: args => ({
		components: { BaseRange },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'thumb', 'onUpdate:modelValue']), opacity: ref(0.5) }),
		template: '<div class="story-narrow"><BaseRange v-bind="props" v-model="opacity" /></div>',
	}),
	play: async ({ canvas, userEvent }) => {
		const thumb = canvas.getByRole('slider', { name: 'Прозрачность' })
		await tabTo(thumb, userEvent)
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}')
		await waitFor(() => expect(thumb).toHaveAttribute('aria-valuenow', '0.3'))
		await expect(canvas.getByText('0.3')).toBeVisible()
	},
}
