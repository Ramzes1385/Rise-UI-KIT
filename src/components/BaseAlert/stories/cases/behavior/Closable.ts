import { MESSAGES } from '../../shared'
import type meta from '../../BaseAlert.stories'
import { expect, waitFor } from 'storybook/test'
import BaseAlert from '../../../ui/BaseAlert.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { isVisible: true }

const template = `
	<div class="story-col story-medium">
		<BaseAlert v-if="isVisible" v-bind="args" style="width: 100%;" @close="isVisible = false" />
		<BaseButton v-else variant="outline" @click="isVisible = true">Показать снова</BaseButton>
	</div>
`

export const Closable: StoryObj<typeof meta> = {
	args: {
		type: 'success',
		title: MESSAGES.success.title,
		description: MESSAGES.success.description,
		isClosable: true,
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Закрытие: кнопка «Закрыть» скрывает алерт с анимацией ухода (прозрачность и масштаб на токенах движения),',
					'после неё приходит событие `close` — родитель убирает алерт из разметки (`v-if`). При выключенном движении — сразу.',
					'После закрытия здесь появляется кнопка «Показать снова».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAlert', 'BaseButton'], state }),
		},
	},
	render: args => ({
		components: { BaseAlert, BaseButton },
		setup: useStorySetup(args, { state }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce())
		await waitFor(() => expect(canvas.queryByRole('status')).toBeNull())
		await userEvent.click(await canvas.findByRole('button', { name: 'Показать снова' }))
		await expect(canvas.getByRole('status')).toHaveTextContent(MESSAGES.success.title)
	},
}
