import { BaseText } from '@components/BaseText'
import type meta from '../../BasePopover.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopover from '../../../ui/BasePopover.vue'
import { expect, screen, waitFor } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const models = { isOpen: 'isOpen' }

const template = `
	<BasePopover v-bind="args" v-model:is-open="isOpen">
		<template #trigger>
			<BaseText tag="span">Что входит в тариф?</BaseText>
		</template>
		<BaseText>До 20 проектов, общий доступ для команды и история правок за 30 дней.</BaseText>
	</BasePopover>
`

export const TextTrigger: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Триггер без кнопки: в слоте `trigger` текст. Кит делает первый элемент слота кнопкой — `role="button"`, `tabindex="0"`,',
					'Enter и Space открывают и закрывают поповер. Кнопку, ссылку или поле в слоте кит не меняет.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BasePopover', 'BaseText'], models }),
		},
	},
	render: args => ({
		components: { BasePopover, BaseText },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('button', { name: 'Что входит в тариф?' })
		await tabTo(trigger, userEvent)
		await expect(getComputedStyle(trigger).outlineStyle).toBe('solid')

		await userEvent.keyboard('{Enter}')
		await expect(await screen.findByText(/До 20 проектов/)).toBeInTheDocument()
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByText(/До 20 проектов/)).not.toBeInTheDocument())
		await expect(trigger).toHaveFocus()

		await userEvent.keyboard(' ')
		await expect(await screen.findByText(/До 20 проектов/)).toBeInTheDocument()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByText(/До 20 проектов/)).not.toBeInTheDocument())
	},
}
