import { expect } from 'storybook/test'
import type meta from '../../BaseFileUpload.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { imageFile, UPLOAD_TIMEOUT } from '../../shared'
import BaseFileUpload from '../../../ui/BaseFileUpload.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import type { FileUploaderContext } from '../../../types/BaseFileUpload.types'

const template = `<BaseFileUpload v-bind="args" :uploader="uploadFile" />`

const script = `
function uploadFile(file: File, { onProgress, signal }: FileUploaderContext): Promise<void> {
	return new Promise((resolve, reject) => {
		let percent = 0
		const timer = setInterval(() => {
			percent += 25
			onProgress(percent)
			if (percent < 100) return
			clearInterval(timer)
			resolve()
		}, 300)
		signal.addEventListener('abort', () => {
			clearInterval(timer)
			reject(signal.reason)
		})
	})
}
`

function uploadFile(_file: File, { onProgress, signal }: FileUploaderContext): Promise<void> {
	return new Promise((resolve, reject) => {
		let percent = 0
		const timer = setInterval(() => {
			percent += 25
			onProgress(percent)
			if (percent < 100) return
			clearInterval(timer)
			resolve()
		}, 300)
		signal.addEventListener('abort', () => {
			clearInterval(timer)
			reject(signal.reason)
		})
	})
}

export const Loading: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Загрузка функцией приложения `uploader(file, { onProgress, signal })`: кит вызывает её для каждого принятого файла,',
					'показывает процент и полосу `BaseProgress` с именем файла из `onProgress`, после выполненного промиса — «Загружено»',
					'и событие `upload-success`. Удаление файла отменяет загрузку через `signal`. Здесь загрузка изображена таймером;',
					'в приложении — `fetch`/`XMLHttpRequest` с `upload.onprogress`. Без `uploader` файл только выбирается — без прогресса.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseFileUpload', 'type FileUploaderContext'],
				script,
				omit: ['uploader'],
			}),
		},
	},
	args: { label: 'Обложка', accept: 'image/*' },
	render: args => ({
		components: { BaseFileUpload },
		setup: useStorySetup(args, { data: { uploadFile } }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.upload(canvas.getByLabelText('Обложка'), imageFile('Обложка.svg', 24))
		await expect(await canvas.findByRole('progressbar', { name: 'Обложка.svg' })).toBeVisible()
		await expect(await canvas.findByText('Загружено', {}, { timeout: UPLOAD_TIMEOUT })).toBeVisible()
		await expect(canvas.queryByRole('progressbar')).not.toBeInTheDocument()
		await expect(canvas.getByRole('status')).toHaveTextContent('Файл «Обложка.svg» загружен')
		await expect(args.onChange).toHaveBeenCalledOnce()
	},
}
