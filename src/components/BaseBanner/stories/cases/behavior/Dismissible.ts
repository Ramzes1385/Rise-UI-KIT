import { MESSAGES } from '../../shared'
import type meta from '../../BaseBanner.stories'
import { expect, waitFor } from 'storybook/test'
import BaseBanner from '../../../ui/BaseBanner.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { isOpen: 'isOpen' } as const

const template = `
	<div class="story-stack">
		<BaseBanner v-bind="args" v-model:is-open="isOpen" />
		<BaseButton v-if="!isOpen" variant="outline" @click="isOpen = true">Показать снова</BaseButton>
	</div>
`

export const Dismissible: StoryObj<typeof meta> = {
	args: { type: 'success', text: MESSAGES.success, isClosable: true },
	parameters: {
		docs: {
			description: {
				story: [
					'Закрытие: кнопка «Закрыть» ставит `isOpen` в `false` (`v-model:is-open`), полоса уходит с анимацией по высоте.',
					'Вернуть показ — `isOpen` в `true`: здесь это кнопка «Показать снова».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseBanner', 'BaseButton'], models: MODELS }),
		},
	},
	render: args => ({
		components: { BaseBanner, BaseButton },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(canvas.queryByRole('region')).toBeNull())
		await userEvent.click(canvas.getByRole('button', { name: 'Показать снова' }))
		await waitFor(() => expect(canvas.getByRole('region', { name: 'Объявление' })).toHaveTextContent(MESSAGES.success))
	},
}
