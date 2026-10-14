import { SHOWCASE_OWN_ARGS } from '../../shared'
import type meta from '../../BasePopover.stories'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopover from '../../../ui/BasePopover.vue'
import { screen, waitFor, expect } from 'storybook/test'
import { docsFrame, literal, storySource, useStorySetup } from '@/stories/helpers'

const statuses = [
	{ value: 'draft', label: 'Черновик' },
	{ value: 'review', label: 'На проверке' },
	{ value: 'published', label: 'Опубликована' },
]

const state = { isOpen: false, status: 'draft' }

const template = `
	<BasePopover v-bind="args" v-model:is-open="isOpen">
		<template #trigger>
			<BaseButton variant="outline">Фильтры</BaseButton>
		</template>
		<div style="width: 240px;">
			<BaseSelect v-model="status" label="Статус серии" :options="statuses" />
		</div>
	</BasePopover>
`

export const NestedList: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['position', 'variant'] },
		docs: {
			...docsFrame(360),
			description: {
				story: [
					'Список в поповере: выбор в выпадающем списке не закрывает поповер, хотя панель списка телепортирована в body.',
					'Escape сначала закрывает список, следующее нажатие — поповер.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BasePopover', 'BaseButton', 'BaseSelect'],
				script: `const statuses = ${literal(statuses)}`,
				state,
				omit: [...SHOWCASE_OWN_ARGS],
			}),
		},
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseSelect },
		setup: useStorySetup(args, { state, data: { statuses }, slots: [...SHOWCASE_OWN_ARGS] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Фильтры' }))
		const select = await screen.findByRole('combobox', { name: 'Статус серии' })

		await userEvent.click(select)
		await userEvent.click(await screen.findByRole('option', { name: 'Опубликована' }))
		await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
		await expect(select).toHaveTextContent('Опубликована')
		await expect(select).toBeVisible()

		await userEvent.click(select)
		await screen.findByRole('listbox')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument())
		await expect(select).toBeVisible()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('combobox', { name: 'Статус серии' })).not.toBeInTheDocument())
	},
}
