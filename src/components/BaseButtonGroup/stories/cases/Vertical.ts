import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../BaseButtonGroup.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseButtonGroup from '../../ui/BaseButtonGroup.vue'

export const Vertical: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Вертикальная группа кнопок-иконок: масштаб карты.' } } },
	args: { orientation: 'vertical', ariaLabel: 'Масштаб' },
	render: args => ({
		components: { BaseButtonGroup, BaseButton, BaseIcon },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BaseButtonGroup v-bind="props">
				<BaseButton variant="outline" aria-label="Приблизить" :padding="{ x: 7, y: 7 }"><BaseIcon name="plus" /></BaseButton>
				<BaseButton variant="outline" aria-label="Отдалить" :padding="{ x: 7, y: 7 }"><BaseIcon name="minus" /></BaseButton>
			</BaseButtonGroup>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('group', { name: 'Масштаб' })).toHaveClass('base-button-group--vertical')
	},
}
