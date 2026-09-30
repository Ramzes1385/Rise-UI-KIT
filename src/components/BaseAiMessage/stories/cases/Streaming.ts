import { AI_ANSWER } from '../shared'
import type meta from '../BaseAiMessage.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BaseAiMessage from '../../ui/BaseAiMessage.vue'
import { literal, STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const STEP = 4

const INTERVAL = 40

const template = `
	<BaseAiMessage v-bind="args" :content="full.slice(0, length)" :is-streaming="isStreaming" />
`

const script = `
const full = ${literal(AI_ANSWER)}
const length = ref(0)
const isStreaming = ref(true)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
	timer = setInterval(() => {
		length.value = Math.min(full.length, length.value + ${STEP})
		isStreaming.value = length.value < full.length
		if (!isStreaming.value) clearInterval(timer)
	}, ${INTERVAL})
})
onBeforeUnmount(() => clearInterval(timer))
`

export const Streaming: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Потоковый ответ: сначала три точки, затем текст частями с курсором; «Копировать ответ» — когда ответ готов.',
			},
			source: storySource({ template, imports: ['BaseAiMessage'], vue: ['onBeforeUnmount', 'onMounted', 'ref'], script }),
		},
	},
	render: args => ({
		components: { BaseAiMessage },
		setup: useStorySetup(args, {
			setup: () => {
				const full = AI_ANSWER
				const length = ref(0)
				const isStreaming = ref(true)
				let timer: ReturnType<typeof setInterval> | undefined
				onMounted(() => {
					timer = setInterval(() => {
						length.value = Math.min(full.length, length.value + STEP)
						isStreaming.value = length.value < full.length
						if (!isStreaming.value) clearInterval(timer)
					}, INTERVAL)
				})
				onBeforeUnmount(() => clearInterval(timer))
				return { full, length, isStreaming }
			},
		}),
		template,
	}),
	play: async ({ canvas }) => {
		const message = canvas.getByRole('article', { name: 'Ассистент' })
		await waitFor(() => expect(message).not.toHaveAttribute('aria-busy'), { timeout: STORY_WAIT_TIMEOUT })
		await expect(canvas.getByRole('button', { name: 'Копировать ответ' })).toBeVisible()
	},
}
