import { ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../../BaseEditor.stories'
import { expect, waitFor, within } from 'storybook/test'
import BaseEditor from '../../../../../ui/BaseEditor.vue'
import { literal, placeholderImage, storySource, useStorySetup } from '@/stories/helpers'

const image = placeholderImage({ width: 480, height: 280, hue: 200 })
const models = { html: 'modelValue' }

const template = `
	<div class="story-medium story-stack">
		<BaseEditor v-bind="args" v-model="html" label="Заметка" :upload-media="uploadMedia" />
		<div class="story-row">
			<BaseButton @click="finish">Завершить загрузку</BaseButton>
			<BaseButton variant="outline" @click="fail">Ошибка загрузки</BaseButton>
			<span class="story-label">Ждут ответа: {{ waiting }}</span>
		</div>
	</div>
`

const script = `
const image = ${literal(image)}
const waiting = ref(0)
const queue: { done: () => void; fail: () => void }[] = []

function uploadMedia(file: File) {
	return new Promise<string>((resolve, reject) => {
		queue.push({ done: () => resolve(image), fail: () => reject(new Error(file.name)) })
		waiting.value = queue.length
	})
}

function finish() {
	queue.shift()?.done()
	waiting.value = queue.length
}

function fail() {
	queue.shift()?.fail()
	waiting.value = queue.length
}
`

function pngFile(): File {
	return new File(['x'], 'stand.png', { type: 'image/png' })
}

export const EditorUpload: StoryObj<typeof meta> = {
	parameters: {
		controls: { exclude: ['modelValue'] },
		docs: {
			description: {
				story: [
					'Загрузка медиа на сервер: проп `uploadMedia(file, { signal })` возвращает адрес или `{ src, alt }`. Файл с кнопок «Изображение» и «Видео»,',
					'из буфера обмена или перетаскивания сначала виден заглушкой (`aria-busy`), а после ответа заменяется изображением или видео.',
					'Незавершённая загрузка не попадает в `v-model`. Ошибка убирает заглушку и показывает сообщение под редактором, событие `upload-error` отдаёт файл и причину.',
					'Если после заглушки ничего не менялось, и ответ, и ошибка укладываются в один шаг истории: «Отменить» убирает изображение целиком.',
					'В примере ответ приходит по кнопкам «Завершить загрузку» и «Ошибка загрузки», а не по таймеру. Без `uploadMedia` кнопки вставляют адрес `blob:`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEditor', 'BaseButton'], models, vue: ['ref'], script }),
		},
	},
	args: { modelValue: '<p>Фото стенда:</p>' },
	render: args => ({
		components: { BaseEditor, BaseButton },
		setup: useStorySetup(args, {
			models,
			setup: () => {
				const waiting = ref(0)
				const queue: { done: () => void; fail: () => void }[] = []
				function uploadMedia(file: File): Promise<string> {
					return new Promise<string>((resolve, reject) => {
						queue.push({ done: () => resolve(image), fail: () => reject(new Error(file.name)) })
						waiting.value = queue.length
					})
				}
				function finish(): void {
					queue.shift()?.done()
					waiting.value = queue.length
				}
				function fail(): void {
					queue.shift()?.fail()
					waiting.value = queue.length
				}
				return { waiting, uploadMedia, finish, fail }
			},
		}),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const textbox = canvas.getByRole('textbox', { name: 'Заметка' })
		const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"][accept="image/*"]') as HTMLInputElement

		await userEvent.upload(input, pngFile())
		await waitFor(() => expect(textbox.querySelector('[data-editor-upload]')).toHaveAttribute('aria-busy', 'true'))
		await expect(canvas.getByText('Ждут ответа: 1')).toBeVisible()

		await userEvent.click(canvas.getByRole('button', { name: 'Завершить загрузку' }))
		await waitFor(() => expect(textbox.querySelector('img')).toHaveAttribute('src', image))
		await expect(textbox.querySelector('[data-editor-upload]')).toBeNull()

		await userEvent.click(canvas.getByRole('button', { name: 'Отменить' }))
		await expect(textbox.querySelector('img')).toBeNull()
		await expect(canvas.getByRole('button', { name: 'Отменить' })).toHaveAttribute('aria-disabled', 'true')

		await userEvent.upload(input, pngFile())
		await userEvent.click(canvas.getByRole('button', { name: 'Ошибка загрузки' }))
		await waitFor(() => expect(within(canvasElement).getByRole('alert')).toHaveTextContent('Не удалось загрузить файл «stand.png»'))
		await expect(textbox.querySelector('[data-editor-upload]')).toBeNull()
		await expect(canvas.getByRole('button', { name: 'Отменить' })).toHaveAttribute('aria-disabled', 'true')
	},
}
