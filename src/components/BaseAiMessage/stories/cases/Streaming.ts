import { AI_ANSWER } from '../shared'
import type meta from '../BaseAiMessage.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BaseAiMessage from '../../ui/BaseAiMessage.vue'
import { STORY_WAIT_TIMEOUT, useArgsWithoutSlots } from '@/stories/helpers'

export const Streaming: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Потоковый ответ: сначала три точки, затем текст частями с курсором; «Копировать ответ» — когда ответ готов.',
			},
		},
	},
	render: args => ({
		components: { BaseAiMessage },
		setup() {
			const length = ref(0)
			const isStreaming = ref(true)
			let timer: ReturnType<typeof setInterval> | undefined
			onMounted(() => {
				timer = setInterval(() => {
					length.value = Math.min(AI_ANSWER.length, length.value + 4)
					isStreaming.value = length.value < AI_ANSWER.length
					if (!isStreaming.value) clearInterval(timer)
				}, 40)
			})
			onBeforeUnmount(() => clearInterval(timer))
			return { props: useArgsWithoutSlots(args), length, isStreaming, full: AI_ANSWER }
		},
		template: '<BaseAiMessage v-bind="props" :content="full.slice(0, length)" :is-streaming="isStreaming" />',
	}),
	play: async ({ canvas }) => {
		const message = canvas.getByRole('article', { name: 'Ассистент' })
		await waitFor(() => expect(message).not.toHaveAttribute('aria-busy'), { timeout: STORY_WAIT_TIMEOUT })
		await expect(canvas.getByRole('button', { name: 'Копировать ответ' })).toBeVisible()
	},
}
