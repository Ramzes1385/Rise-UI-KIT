import { REASONING_SAMPLE } from '../shared'
import type meta from '../BaseReasoning.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BaseReasoning from '../../ui/BaseReasoning.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Streaming: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Поток: блок раскрыт, «Думает…» переливается; когда рассуждения готовы, блок сворачивается и показывает время.',
			},
		},
		controls: { include: ['variant', 'sizeScale', 'hasAutoToggle'] },
	},
	args: { duration: undefined },
	render: args => ({
		components: { BaseReasoning },
		setup() {
			const length = ref(0)
			const isStreaming = ref(true)
			let timer: ReturnType<typeof setInterval> | undefined
			onMounted(() => {
				timer = setInterval(() => {
					length.value = Math.min(REASONING_SAMPLE.length, length.value + 6)
					isStreaming.value = length.value < REASONING_SAMPLE.length
					if (!isStreaming.value) clearInterval(timer)
				}, 40)
			})
			onBeforeUnmount(() => clearInterval(timer))
			return { props: useArgsWithoutSlots(args), length, isStreaming, full: REASONING_SAMPLE }
		},
		template: '<BaseReasoning v-bind="props" :content="full.slice(0, length)" :is-streaming="isStreaming" />',
	}),
	play: async ({ canvas }) => {
		const trigger = canvas.getByRole('button')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await waitFor(() => expect(trigger).toHaveAccessibleName(/^Думал \d+ с$/), { timeout: 6000 })
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
	},
}
