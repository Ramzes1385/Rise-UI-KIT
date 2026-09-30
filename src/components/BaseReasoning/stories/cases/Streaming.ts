import { REASONING_SAMPLE } from '../shared'
import type meta from '../BaseReasoning.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BaseReasoning from '../../ui/BaseReasoning.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const STEP = 6

const INTERVAL = 40

const template = `
	<BaseReasoning v-bind="args" :content="full.slice(0, length)" :is-streaming="isStreaming" />
`

const script = `
const full = ${literal(REASONING_SAMPLE)}
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
				story: 'Поток: блок раскрыт, «Думает…» переливается; когда рассуждения готовы, блок сворачивается и показывает время.',
			},
			source: storySource({ template, imports: ['BaseReasoning'], vue: ['onBeforeUnmount', 'onMounted', 'ref'], script }),
		},
		controls: { include: ['variant', 'sizeScale', 'hasAutoToggle'] },
	},
	args: { duration: undefined },
	render: args => ({
		components: { BaseReasoning },
		setup: useStorySetup(args, {
			setup: () => {
				const full = REASONING_SAMPLE
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
		const trigger = canvas.getByRole('button')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
		await waitFor(() => expect(trigger).toHaveAccessibleName(/^Думал \d+ с$/), { timeout: 6000 })
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
	},
}
