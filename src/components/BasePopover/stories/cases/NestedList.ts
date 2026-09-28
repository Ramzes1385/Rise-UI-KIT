import { ref } from 'vue'
import type meta from '../BasePopover.stories'
import BasePopover from '../../ui/BasePopover.vue'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { docsFrame, SHOWCASE_OWN_ARGS } from '../shared'
import { screen, waitFor, expect } from 'storybook/test'

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
		},
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseSelect },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...SHOWCASE_OWN_ARGS]),
			isOpen: ref(false),
			status: ref('draft'),
			statuses: [
				{ value: 'draft', label: 'Черновик' },
				{ value: 'review', label: 'На проверке' },
				{ value: 'published', label: 'Опубликована' },
			],
		}),
		template: `
			<BasePopover v-bind="props" v-model:is-open="isOpen">
				<template #trigger>
					<BaseButton variant="outline">Фильтры</BaseButton>
				</template>
				<div style="width: 240px;">
					<BaseSelect v-model="status" label="Статус серии" :options="statuses" />
				</div>
			</BasePopover>
		`,
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
