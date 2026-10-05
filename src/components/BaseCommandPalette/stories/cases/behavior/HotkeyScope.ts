import { BaseKbd } from '@components/BaseKbd'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCommandPalette.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import { expect, screen, waitFor, within } from 'storybook/test'
import BaseCommandPalette from '../../../ui/BaseCommandPalette.vue'

const state = { isOpen: false }

const template = `
	<div style="display: flex; flex-direction: column; gap: 12px; max-width: 360px">
		<label style="display: flex; flex-direction: column; gap: 4px">
			Поле вне блока палитры
			<input type="text" placeholder="Здесь Ctrl+K не откроет палитру" />
		</label>
		<div style="display: flex; flex-direction: column; gap: 4px; padding: 12px; border: 1px dashed var(--rise-border-accented)">
			<label style="display: flex; flex-direction: column; gap: 4px">
				Блок с палитрой: <span>фокус здесь, затем <BaseKbd value="meta" /><BaseKbd value="K" /></span>
				<input type="text" placeholder="Нажмите Ctrl+K" />
			</label>
			<BaseCommandPalette v-bind="args" v-model:is-open="isOpen" />
		</div>
	</div>
`

export const HotkeyScope: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`hotkeyScope="container"` — сочетание работает, только когда фокус внутри блока, где стоит палитра:',
					'так несколько палитр не мешают друг другу и остальной странице. По умолчанию (`global`) — на всей странице.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCommandPalette', 'BaseKbd'], state }),
		},
	},
	args: { hotkeyScope: 'container' },
	render: args => ({
		components: { BaseCommandPalette, BaseKbd },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('textbox', { name: 'Поле вне блока палитры' }))
		await userEvent.keyboard('{Control>}k{/Control}')
		await expect(screen.queryByRole('dialog')).toBeNull()
		await userEvent.click(canvas.getByRole('textbox', { name: /Блок с палитрой/ }))
		await userEvent.keyboard('{Control>}k{/Control}')
		const dialog = await screen.findByRole('dialog', { name: 'Палитра команд' })
		await waitFor(() => expect(within(dialog).getByRole('combobox', { name: 'Поиск команды' })).toHaveFocus())
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
	},
}
