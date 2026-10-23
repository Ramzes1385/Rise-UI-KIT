import { ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDropdownMenu.stories'
import BaseDropdownMenu from '../../../ui/BaseDropdownMenu.vue'
import { screen, within, expect, waitFor } from 'storybook/test'
import { docsFrame, storySource, useStorySetup } from '@/stories/helpers'
import type { DropdownMenuItem } from '../../../types/BaseDropdownMenu.types'

const script = `
const columns = ref({ title: true, duration: true, author: false })
const sort = ref<'date' | 'title'>('date')

function items(): DropdownMenuItem[][] {
	return [
		[
			{ type: 'label', label: 'Колонки' },
			...(['title', 'duration', 'author'] as const).map(key => ({
				type: 'checkbox' as const,
				label: { title: 'Название', duration: 'Длительность', author: 'Автор перевода' }[key],
				isChecked: columns.value[key],
				onUpdateChecked: (value: boolean) => (columns.value[key] = value),
			})),
		],
		[
			{ type: 'label', label: 'Сортировка' },
			{ type: 'radio', label: 'По дате', isChecked: sort.value === 'date', onUpdateChecked: () => (sort.value = 'date') },
			{ type: 'radio', label: 'По названию', isChecked: sort.value === 'title', onUpdateChecked: () => (sort.value = 'title') },
		],
	]
}
`

const template = `
	<BaseDropdownMenu v-bind="args" :items="items()">
		<BaseButton variant="outline">Вид таблицы</BaseButton>
	</BaseDropdownMenu>
`

export const CheckboxesAndRadios: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			...docsFrame(340),
			description: {
				story: [
					'Флажки и переключатели: колонки таблицы и сортировка. Клик и Space меняют отметку, меню остаётся открытым;',
					'Enter меняет отметку и закрывает меню. Подписи групп называют группы для скринридера.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseDropdownMenu', 'BaseButton', 'type DropdownMenuItem'],
				vue: ['ref'],
				script,
				omit: ['items'],
			}),
		},
	},
	render: args => ({
		components: { BaseDropdownMenu, BaseButton },
		setup: useStorySetup(args, {
			slots: ['items'],
			setup: () => {
				const columns = ref({ title: true, duration: true, author: false })
				const sort = ref<'date' | 'title'>('date')
				const items = (): DropdownMenuItem[][] => [
					[
						{ type: 'label', label: 'Колонки' },
						...(['title', 'duration', 'author'] as const).map(key => ({
							type: 'checkbox' as const,
							label: { title: 'Название', duration: 'Длительность', author: 'Автор перевода' }[key],
							isChecked: columns.value[key],
							onUpdateChecked: (value: boolean) => (columns.value[key] = value),
						})),
					],
					[
						{ type: 'label', label: 'Сортировка' },
						{ type: 'radio', label: 'По дате', isChecked: sort.value === 'date', onUpdateChecked: () => (sort.value = 'date') },
						{
							type: 'radio',
							label: 'По названию',
							isChecked: sort.value === 'title',
							onUpdateChecked: () => (sort.value = 'title'),
						},
					],
				]
				return { items }
			},
		}),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Вид таблицы' }))
		const menu = await screen.findByRole('menu')
		const author = within(menu).getByRole('menuitemcheckbox', { name: 'Автор перевода' })
		await expect(author).toHaveAttribute('aria-checked', 'false')

		await userEvent.click(author)
		await expect(within(menu).getByRole('menuitemcheckbox', { name: 'Автор перевода' })).toHaveAttribute('aria-checked', 'true')
		await expect(within(menu).getByRole('group', { name: 'Сортировка' })).toBeInTheDocument()

		await userEvent.click(within(menu).getByRole('menuitemradio', { name: 'По названию' }))
		await expect(within(menu).getByRole('menuitemradio', { name: 'По названию' })).toHaveAttribute('aria-checked', 'true')
		await expect(within(menu).getByRole('menuitemradio', { name: 'По дате' })).toHaveAttribute('aria-checked', 'false')

		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
	},
}
