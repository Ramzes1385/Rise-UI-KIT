import { expect } from 'storybook/test'
import type meta from '../BaseToolbar.stories'
import { BaseInput } from '@components/BaseInput'
import BaseToolbar from '../../ui/BaseToolbar.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseDropdownMenu } from '@components/BaseDropdownMenu'
import { literal, storySource, useStorySetup, inlineKey } from '@/stories/helpers'

const items = [{ label: 'Экспорт в CSV' }, { label: 'Экспорт в Excel' }]

const template = `
	<BaseToolbar v-bind="args">
		<BaseButton variant="outline">Архивировать</BaseButton>
		<BaseInput model-value="" aria-label="Поиск по строкам" placeholder="Поиск" style="width: 180px;" />
		<BaseDropdownMenu :items="items"><BaseButton variant="outline">Экспорт</BaseButton></BaseDropdownMenu>
	</BaseToolbar>
`

export const WithFieldAndMenu: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Поле и меню в панели: в поле стрелки двигают курсор, меню открывается как обычно.' },
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseDropdownMenu', 'BaseInput', 'BaseToolbar'],
				script: `const items = ${literal(items)}`,
			}),
		},
	},
	args: { ariaLabel: 'Действия со строками' },
	render: args => ({
		components: { BaseToolbar, BaseButton, BaseInput, BaseDropdownMenu },
		setup: useStorySetup(args, { data: { items }, slots: [] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const search = canvas.getByRole('textbox', { name: 'Поиск по строкам' })
		await userEvent.click(search)
		await userEvent.keyboard('ab' + inlineKey('{ArrowLeft}'))
		await expect(search).toHaveFocus()
	},
}
