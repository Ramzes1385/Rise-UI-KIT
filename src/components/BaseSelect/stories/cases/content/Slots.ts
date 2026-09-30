import { docsFrame } from '../../shared'
import type meta from '../../BaseSelect.stories'
import BaseSelect from '../../../ui/BaseSelect.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, screen, waitFor } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'
import type { BaseSelectOption } from '../../../types/BaseSelect.types'

const STATUSES: (BaseSelectOption & { color: string })[] = [
	{ value: 'todo', label: 'К выполнению', color: 'var(--rise-text-dimmed)' },
	{ value: 'progress', label: 'В работе', color: 'var(--rise-info)' },
	{ value: 'review', label: 'На проверке', color: 'var(--rise-warning)' },
	{ value: 'done', label: 'Готово', color: 'var(--rise-success)' },
]

const models = { selected: 'modelValue' }

const template = `
	<div class="story-narrow">
		<BaseSelect v-bind="args" v-model="selected">
			<template #option="{ option }">
				<span :style="{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: option.color }" />
				{{ option.label }}
			</template>
			<template #selected="{ option }">
				<span :style="{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, background: option.color }" />
				{{ option.label }}
			</template>
			<template #footer>
				<BaseButton variant="ghost" style="width: 100%;">Настроить статусы</BaseButton>
			</template>
		</BaseSelect>
	</div>
`

export const Slots: StoryObj<typeof meta> = {
	args: { label: 'Статус задачи', options: STATUSES, modelValue: 'progress', placeholder: 'Выберите статус' },
	parameters: {
		docs: {
			description: {
				story: [
					'Слоты: `option` — своя разметка опции (здесь цветная точка статуса), `selected` — значение в триггере,',
					'`footer` — действие под списком.',
				].join('\n'),
			},
			...docsFrame(300),
			source: storySource({ template, imports: ['BaseSelect', 'BaseButton'], models, omit: [] }),
		},
	},
	render: args => ({
		components: { BaseSelect, BaseButton },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Статус задачи' })
		await expect(trigger).toHaveTextContent('В работе')
		await userEvent.click(trigger)
		const action = await screen.findByRole('button', { name: 'Настроить статусы' })
		await waitFor(() => expect(action).toBeVisible())
		await expect(screen.getAllByRole('option')).toHaveLength(4)
	},
}
