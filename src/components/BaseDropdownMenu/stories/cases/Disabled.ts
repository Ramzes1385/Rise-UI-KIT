import { docsFrame } from '../shared'
import type meta from '../BaseDropdownMenu.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseDropdownMenu from '../../ui/BaseDropdownMenu.vue'
import { screen, waitFor, expect, within } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row">
		<BaseDropdownMenu v-bind="args">
			<BaseButton variant="outline">Черновик</BaseButton>
		</BaseDropdownMenu>
		<BaseDropdownMenu v-bind="args" aria-label="Недоступно">
			<BaseButton variant="outline" is-disabled>Архив</BaseButton>
		</BaseDropdownMenu>
	</div>
`

export const Disabled: StoryObj<typeof meta> = {
	args: {
		items: [
			[
				{ label: 'Опубликовать', isDisabled: true },
				{ label: 'Сохранить черновик' },
				{ label: 'Отправить на проверку', isDisabled: true },
				{ label: 'Удалить' },
			],
		],
	},
	parameters: {
		docs: {
			...docsFrame(260),
			description: {
				story: [
					'Отключённые пункты: видны приглушёнными, стрелки их пропускают, клик ничего не делает.',
					'Отключённая кнопка (`isDisabled` у BaseButton) меню не открывает.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDropdownMenu', 'BaseButton'] }),
		},
	},
	render: args => ({
		components: { BaseDropdownMenu, BaseButton },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Черновик' })
		await tabTo(trigger, userEvent)
		await userEvent.keyboard('{ArrowDown}')
		const menu = await screen.findByRole('menu')
		await waitFor(() => expect(within(menu).getByRole('menuitem', { name: 'Сохранить черновик' })).toHaveFocus())
		await expect(within(menu).getByRole('menuitem', { name: 'Опубликовать' })).toHaveAttribute('aria-disabled', 'true')

		await userEvent.keyboard('{ArrowDown}')
		await expect(within(menu).getByRole('menuitem', { name: 'Удалить' })).toHaveFocus()
		await userEvent.keyboard('{Escape}')
		await expect(canvas.getByRole('button', { name: 'Архив' })).toBeDisabled()
	},
}
