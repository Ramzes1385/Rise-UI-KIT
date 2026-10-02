import { expect } from 'storybook/test'
import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFileUpload from '../../../ui/BaseFileUpload.vue'
import { documentFile, UPLOAD_TIMEOUT } from '../../shared'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<BaseFileUpload v-bind="args" :uploader="uploadFile" />`

const script = `
let attempt = 0

function uploadFile(): Promise<void> {
	attempt += 1
	return attempt === 1 ? Promise.reject(new Error('Сервер недоступен, попробуйте ещё раз')) : Promise.resolve()
}
`

function createUploader() {
	let attempt = 0
	return function uploadFile(): Promise<void> {
		attempt += 1
		return attempt === 1 ? Promise.reject(new Error('Сервер недоступен, попробуйте ещё раз')) : Promise.resolve()
	}
}

export const UploadError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ошибка загрузки: `uploader` отклонил промис — у файла статус «Ошибка», под именем текст ошибки (`message`),',
					'событие `upload-error`, скринридер слышит «Не удалось загрузить…». Кнопка с круговой стрелкой повторяет загрузку',
					'(то же — метод `retry(file)` через ref). Здесь первая попытка падает, вторая проходит.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFileUpload'], script, omit: ['uploader'] }),
		},
	},
	args: { label: 'Акт выполненных работ', accept: '.pdf' },
	render: args => ({
		components: { BaseFileUpload },
		setup: useStorySetup(args, { setup: () => ({ uploadFile: createUploader() }) }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.upload(canvas.getByLabelText('Акт выполненных работ'), documentFile('Акт.pdf', 120))
		await expect(await canvas.findByText('Сервер недоступен, попробуйте ещё раз')).toBeVisible()
		await expect(canvas.getByRole('status')).toHaveTextContent('Не удалось загрузить «Акт.pdf»: Сервер недоступен, попробуйте ещё раз')

		const retry = canvas.getByRole('button', { name: 'Повторить загрузку «Акт.pdf»' })
		retry.focus()
		await userEvent.keyboard('{Enter}')
		await expect(await canvas.findByText('Загружено', {}, { timeout: UPLOAD_TIMEOUT })).toBeVisible()
		await expect(canvas.queryByRole('button', { name: 'Повторить загрузку «Акт.pdf»' })).not.toBeInTheDocument()
	},
}
