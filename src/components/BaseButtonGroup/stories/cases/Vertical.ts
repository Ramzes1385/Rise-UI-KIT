import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import type meta from '../BaseButtonGroup.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseButtonGroup from '../../ui/BaseButtonGroup.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseButtonGroup v-bind="args">
		<BaseButton variant="outline" aria-label="Приблизить" :padding="{ x: 7, y: 7 }"><BaseIcon name="plus" /></BaseButton>
		<BaseButton variant="outline" aria-label="Отдалить" :padding="{ x: 7, y: 7 }"><BaseIcon name="minus" /></BaseButton>
	</BaseButtonGroup>
`

export const Vertical: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Вертикальная группа кнопок-иконок: масштаб карты.' },
			source: storySource({ template, imports: ['BaseButtonGroup', 'BaseButton', 'BaseIcon'], omit: [] }),
		},
	},
	args: { orientation: 'vertical', ariaLabel: 'Масштаб' },
	render: args => ({
		components: { BaseButtonGroup, BaseButton, BaseIcon },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('group', { name: 'Масштаб' })).toHaveClass('base-button-group--vertical')
	},
}
