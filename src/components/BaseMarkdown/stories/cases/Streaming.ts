import { STREAM_SAMPLE } from '../shared'
import type meta from '../BaseMarkdown.stories'
import { expect, waitFor } from 'storybook/test'
import BaseMarkdown from '../../ui/BaseMarkdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { literal, STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const STEP = 3

const DELAY = 30

const template = `
	<BaseMarkdown v-bind="args" :source="full.slice(0, length)" :is-streaming="length < full.length" variant="soft" />
`

const script = `
	const full = ${literal(STREAM_SAMPLE)}
	const length = ref(0)
	let timer

	onMounted(() => {
		timer = setInterval(() => {
			length.value = Math.min(full.length, length.value + ${STEP})
			if (length.value === full.length) clearInterval(timer)
		}, ${DELAY})
	})
	onBeforeUnmount(() => clearInterval(timer))
`

export const Streaming: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Потоковый ответ: текст приходит частями, `is-streaming` показывает курсор в конце, незакрытый блок кода',
					'виден до конца. Разметка перестраивается на каждом куске — выделение появляется, когда закрыт маркер.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseMarkdown'],
				vue: ['onBeforeUnmount', 'onMounted', 'ref'],
				script,
				omit: ['variant'],
			}),
		},
	},
	render: args => {
		const length = ref(0)
		let timer: ReturnType<typeof setInterval> | undefined
		const start = (): void => {
			timer = setInterval(() => {
				length.value = Math.min(STREAM_SAMPLE.length, length.value + STEP)
				if (length.value === STREAM_SAMPLE.length) clearInterval(timer)
			}, DELAY)
		}
		const setup = useStorySetup(args, { data: { length, full: STREAM_SAMPLE } })
		return {
			components: { BaseMarkdown },
			setup: () => {
				onMounted(start)
				onBeforeUnmount(() => clearInterval(timer))
				return setup()
			},
			template,
		}
	},
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('.base-markdown') as HTMLElement
		await waitFor(() => expect(root.getAttribute('aria-busy')).toBeNull(), { timeout: STORY_WAIT_TIMEOUT })
		await expect(root.querySelector('.base-markdown__caret')).toBeNull()
		await expect(root.querySelector('pre')?.textContent).toContain('items.reduce')
	},
}
