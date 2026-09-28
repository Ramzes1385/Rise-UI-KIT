import { expect } from 'storybook/test'
import type meta from '../BaseToolbar.stories'
import { BaseIcon } from '@components/BaseIcon'
import BaseToolbar from '../../ui/BaseToolbar.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { BaseSeparator } from '@components/BaseSeparator'
import { FORMAT_BUTTONS, ALIGN_BUTTONS, TOOLBAR_TEMPLATE } from '../shared'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённая кнопка («По центру») пропускается стрелками.' } } },
	render: args => ({
		components: { BaseToolbar, BaseButton, BaseIcon, BaseSeparator },
		setup: () => ({ props: useArgsWithoutSlots(args, []), format: FORMAT_BUTTONS, align: ALIGN_BUTTONS, disabledIcon: 'align-center' }),
		template: TOOLBAR_TEMPLATE,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('button', { name: 'По центру' })).toBeDisabled()
		canvas.getByRole('button', { name: 'По левому краю' }).focus()
		await userEvent.keyboard('{ArrowRight}')
		await expect(canvas.getByRole('button', { name: 'По правому краю' })).toHaveFocus()
	},
}
