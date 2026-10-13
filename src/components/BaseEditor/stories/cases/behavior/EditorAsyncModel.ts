import { onBeforeUnmount, ref } from 'vue'
import type meta from '../../BaseEditor.stories'
import BaseEditor from '../../../ui/BaseEditor.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const SAVE_DELAY = 300

const template = `
	<div class="story-medium story-stack">
		<BaseEditor v-bind="args" :model-value="saved" @update:model-value="save" />
		<span class="story-label">Ответов сервера: {{ answers }}</span>
	</div>
`

const script = `
const saved = ref('<p>Родитель отвечает с задержкой</p>')
const answers = ref(0)
const timers: ReturnType<typeof setTimeout>[] = []

function save(value: string) {
	timers.push(
		setTimeout(() => {
			saved.value = value
			answers.value += 1
		}, ${SAVE_DELAY}),
	)
}
onBeforeUnmount(() => timers.forEach(clearTimeout))
`

export const EditorAsyncModel: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['modelValue'] },
		docs: {
			description: {
				story: [
					'Асинхронный родитель: значение возвращается через 300 мс (сохранение на сервер). Редактор держит набранное внутри и',
					'сравнивает ответ с тем, что отправил сам, поэтому запоздалые ответы не откатывают текст и не сбивают каретку.',
					'Значение, которого редактор не отправлял (сброс формы, загрузка черновика), заменяет текст как обычно.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEditor'], vue: ['onBeforeUnmount', 'ref'], script }),
		},
	},
	render: args => ({
		components: { BaseEditor },
		setup: useStorySetup(args, {
			setup: () => {
				const saved = ref('<p>Родитель отвечает с задержкой</p>')
				const answers = ref(0)
				const timers: ReturnType<typeof setTimeout>[] = []
				function save(value: string): void {
					timers.push(
						setTimeout(() => {
							saved.value = value
							answers.value += 1
						}, SAVE_DELAY),
					)
				}
				onBeforeUnmount(() => timers.forEach(clearTimeout))
				return { saved, answers, save }
			},
		}),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Текстовый редактор' })
		await userEvent.click(within(textbox).getByText('Родитель отвечает с задержкой'))
		await userEvent.keyboard('{End} раз два три')
		await waitFor(() => expect(canvas.getByText(/Ответов сервера: [1-9]/)).toBeVisible(), { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.keyboard(' четыре')
		await new Promise(resolve => setTimeout(resolve, SAVE_DELAY * 2))
		await expect(textbox).toHaveTextContent('Родитель отвечает с задержкой раз два три четыре')
		await expect(textbox).toHaveFocus()
	},
}
