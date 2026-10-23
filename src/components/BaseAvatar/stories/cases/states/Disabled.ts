import { expect } from 'storybook/test'
import type meta from '../../BaseAvatar.stories'
import BaseAvatar from '../../../ui/BaseAvatar.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { clicks: 0 }

const template = `
	<div class="story-row">
		<BaseAvatar v-bind="args" @click="clicks++" />
		<span class="story-label" role="status">Нажатий: {{ clicks }}</span>
	</div>
`

export const Disabled: StoryObj<typeof meta> = {
	args: { isDisabled: true },
	parameters: {
		controls: { include: ['name', 'isDisabled', 'sizeScale'] },
		docs: {
			description: {
				story: 'Выключенный кликабельный аватар (`isDisabled`): `aria-disabled="true"`, не получает фокус с Tab, `click` не приходит.',
			},
			source: storySource({ template, imports: ['BaseAvatar'], state }),
		},
	},
	render: args => ({
		components: { BaseAvatar },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const avatar = canvas.getByRole('button', { name: String(args.name) })
		await expect(avatar).toHaveAttribute('aria-disabled', 'true')
		await expect(avatar).not.toHaveAttribute('tabindex')
		await userEvent.click(avatar)
		await expect(canvas.getByRole('status')).toHaveTextContent('Нажатий: 0')
	},
}
