import { STREAM_SAMPLE } from '../shared'
import type meta from '../BaseMarkdown.stories'
import { expect, waitFor } from 'storybook/test'
import BaseMarkdown from '../../ui/BaseMarkdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { STORY_WAIT_TIMEOUT, useArgsWithoutSlots } from '@/stories/helpers'

const STEP = 3

const DELAY = 30

export const Streaming: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Потоковый ответ: текст приходит частями, `is-streaming` показывает курсор в конце, незакрытый блок кода',
					'виден до конца. Разметка перестраивается на каждом куске — выделение появляется, когда закрыт маркер.',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseMarkdown },
		setup() {
			const length = ref(0)
			let timer: ReturnType<typeof setInterval> | undefined
			onMounted(() => {
				timer = setInterval(() => {
					length.value = Math.min(STREAM_SAMPLE.length, length.value + STEP)
					if (length.value === STREAM_SAMPLE.length) clearInterval(timer)
				}, DELAY)
			})
			onBeforeUnmount(() => clearInterval(timer))
			return { props: useArgsWithoutSlots(args), length, full: STREAM_SAMPLE }
		},
		template: '<BaseMarkdown v-bind="props" :source="full.slice(0, length)" :is-streaming="length < full.length" variant="soft" />',
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('.base-markdown') as HTMLElement
		await waitFor(() => expect(root.getAttribute('aria-busy')).toBeNull(), { timeout: STORY_WAIT_TIMEOUT })
		await expect(root.querySelector('.base-markdown__caret')).toBeNull()
		await expect(root.querySelector('pre')?.textContent).toContain('items.reduce')
	},
}
