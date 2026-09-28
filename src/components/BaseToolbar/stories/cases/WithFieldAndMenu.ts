import { expect } from 'storybook/test'
import type meta from '../BaseToolbar.stories'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import BaseToolbar from '../../ui/BaseToolbar.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'

export const WithFieldAndMenu: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Поле и меню в панели: в поле стрелки двигают курсор, меню открывается как обычно.' } } },
	args: { ariaLabel: 'Действия со строками' },
	render: args => ({
		components: { BaseToolbar, BaseButton, BaseIcon, BaseInput, BaseDropdownMenu },
		setup: () => ({ props: useArgsWithoutSlots(args, []), items: [{ label: 'Экспорт в CSV' }, { label: 'Экспорт в Excel' }] }),
		template: `
			<BaseToolbar v-bind="props">
				<BaseButton variant="outline">Архивировать</BaseButton>
				<BaseInput model-value="" aria-label="Поиск по строкам" placeholder="Поиск" style="width: 180px;" />
				<BaseDropdownMenu :items="items"><BaseButton variant="outline">Экспорт</BaseButton></BaseDropdownMenu>
			</BaseToolbar>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const search = canvas.getByRole('textbox', { name: 'Поиск по строкам' })
		await userEvent.click(search)
		await userEvent.keyboard('ab{ArrowLeft}')
		await expect(search).toHaveFocus()
	},
}
