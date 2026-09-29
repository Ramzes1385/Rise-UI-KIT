import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, tabTo } from '@/stories/helpers'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab ставит фокус на ползунок, стрелки вправо/вверх увеличивают значение на `step`, влево/вниз —',
					'уменьшают; каждый шаг с клавиатуры — завершённый выбор, поэтому приходит и `change`.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseRange },
		setup: () => ({ props: useArgsWithoutSlots(args, ['modelValue', 'thumb', 'onUpdate:modelValue']), volume: ref(40) }),
		template: '<div class="story-narrow"><BaseRange v-bind="props" v-model="volume" /></div>',
	}),
	play: async ({ canvas, userEvent, args }) => {
		const thumb = canvas.getByRole('slider', { name: 'Громкость' })
		await tabTo(thumb, userEvent)

		await userEvent.keyboard('{ArrowRight}')
		await expect(thumb).toHaveAttribute('aria-valuenow', '41')
		await expect(args.onChange).toHaveBeenLastCalledWith(41)

		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await expect(thumb).toHaveAttribute('aria-valuenow', '39')
		await expect(args.onChange).toHaveBeenLastCalledWith(39)
	},
}
