import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FILE_UPLOAD } from '@/locales/messages'
import { useFileUploadState } from '../useFileUploadState'
import type { UseFileUploadStateOptions } from '../types/useFileUploadState.types'
import type { FileUploaderContext } from '@components/BaseFileUpload/types/BaseFileUpload.types'

const image = (name: string, size = 10) => new File(['x'.repeat(size)], name, { type: 'image/png' })
const doc = (name: string) => new File(['doc'], name, { type: 'application/pdf' })

function deferredUploader() {
	const calls: { file: File; context: FileUploaderContext; resolve: (value: unknown) => void; reject: (error: unknown) => void }[] = []
	const uploader = vi.fn(
		(file: File, context: FileUploaderContext) =>
			new Promise<unknown>((resolve, reject) => {
				calls.push({ file, context, resolve, reject })
			}),
	)
	return { uploader, calls }
}

function setup(overrides: Partial<UseFileUploadStateOptions> = {}) {
	const options = {
		getMaxSize: () => 1,
		getAccept: () => '',
		getMaxCount: () => 3,
		onError: vi.fn(),
		onChange: vi.fn(),
		onRemove: vi.fn(),
		...overrides,
	}
	let state!: ReturnType<typeof useFileUploadState>
	const wrapper = mount(
		defineComponent({
			setup() {
				state = useFileUploadState(options)
				return () => h('div')
			},
		}),
	)
	return { state, options, wrapper }
}

const flush = () => new Promise<void>(resolve => setTimeout(resolve, 0))

describe('useFileUploadState', () => {
	let counter = 0

	beforeEach(() => {
		counter = 0
		vi.stubGlobal('URL', {
			...URL,
			createObjectURL: vi.fn((file: File) => `blob:${file.name}#${++counter}`),
			revokeObjectURL: vi.fn(),
		})
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
	})

	describe('выбор без uploader', () => {
		it('добавляет файлы со статусом selected, без прогресса и таймеров; превью картинки — objectURL', () => {
			vi.useFakeTimers()
			const { state, options } = setup()
			const files = [image('a.png'), doc('b.pdf')]
			state.addFiles(files)

			expect(state.uploadedFiles.value.map(file => [file.name, file.extension, file.status, file.progress, file.previewUrl])).toEqual(
				[
					['a.png', 'png', 'selected', 0, 'blob:a.png#1'],
					['b.pdf', 'pdf', 'selected', 0, null],
				],
			)
			expect(options.onChange).toHaveBeenCalledWith(files)
			expect(vi.getTimerCount()).toBe(0)
			vi.advanceTimersByTime(5000)
			expect(state.uploadedFiles.value[0].status).toBe('selected')
		})

		it('getAllowPreview=false — картинка без превью, objectURL не создаётся', () => {
			const { state } = setup({ getAllowPreview: () => false })
			state.addFiles([image('a.png')])
			expect(state.uploadedFiles.value[0].previewUrl).toBeNull()
			expect(URL.createObjectURL).not.toHaveBeenCalled()
		})

		it('getUploader без функции — файл остаётся selected', () => {
			const { state } = setup({ getUploader: () => undefined })
			state.addFiles([doc('a.pdf')])
			expect(state.uploadedFiles.value[0].status).toBe('selected')
		})

		it('пустой список файлов ничего не меняет', () => {
			const { state, options } = setup()
			state.addFiles([])
			expect(options.onChange).not.toHaveBeenCalled()
		})
	})

	describe('множественный выбор и лимит', () => {
		it('без опции множественного выбора файлы добавляются к выбранным', () => {
			const { state } = setup()
			state.addFiles([doc('a.pdf')])
			state.addFiles([doc('b.pdf')])
			expect(state.uploadedFiles.value.map(file => file.name)).toEqual(['a.pdf', 'b.pdf'])
		})

		it('сначала проверка, потом лимит: невалидные файлы не занимают места', () => {
			const { state, options } = setup({ getMaxCount: () => 2, getAccept: () => 'image/*' })
			state.addFiles([doc('bad.pdf'), doc('bad2.pdf'), image('ok.png')])

			expect(state.uploadedFiles.value.map(file => file.name)).toEqual(['ok.png'])
			expect(options.onError).toHaveBeenCalledTimes(2)
		})

		it('лишние валидные файлы отбрасываются с одной ошибкой лимита', () => {
			const { state, options } = setup({ getMaxCount: () => 2, getIsMultiple: () => true })
			state.addFiles([doc('a.pdf'), doc('b.pdf'), doc('c.pdf')])

			const message = formatMessage(UI_FILE_UPLOAD.MAX_COUNT, { count: 2 })
			expect(state.uploadedFiles.value.map(file => file.name)).toEqual(['a.pdf', 'b.pdf'])
			expect(state.displayErrors.value).toEqual([message])
			expect(options.onError).toHaveBeenCalledWith(message)
			expect(options.onChange).toHaveBeenCalledTimes(1)
		})

		it('ошибки заменяются, а не копятся: повторная попытка сверх лимита — одна ошибка', () => {
			const { state, options } = setup({ getMaxCount: () => 1 })
			state.addFiles([doc('a.pdf')])
			state.addFiles([doc('b.pdf')])
			state.addFiles([doc('c.pdf')])

			expect(state.displayErrors.value).toHaveLength(1)
			expect(state.hasError.value).toBe(true)
			expect(options.onChange).toHaveBeenCalledTimes(1)
		})

		it('удаление снимает ошибку лимита, но не ошибки формата', () => {
			const { state } = setup({ getMaxCount: () => 1, getAccept: () => '.pdf' })
			state.addFiles([doc('a.pdf')])
			state.addFiles([image('b.png'), doc('c.pdf')])
			expect(state.displayErrors.value).toHaveLength(2)

			state.handleRemove(state.uploadedFiles.value[0])
			expect(state.displayErrors.value).toHaveLength(1)
			expect(state.displayErrors.value[0]).toContain('b.png')
		})

		it('новый выбор очищает прошлые ошибки', () => {
			const { state } = setup({ getAccept: () => '.pdf' })
			state.addFiles([image('a.png')])
			expect(state.hasError.value).toBe(true)
			state.addFiles([doc('b.pdf')])
			expect(state.hasError.value).toBe(false)
		})

		it('отклоняет файлы с неверным размером', () => {
			const { state, options } = setup()
			state.addFiles([image('big.png', 2 * 1024 * 1024)])
			expect(state.uploadedFiles.value).toHaveLength(0)
			expect(options.onError).toHaveBeenCalledTimes(1)
			expect(options.onChange).not.toHaveBeenCalled()
		})
	})

	describe('одиночный выбор', () => {
		it('новый файл заменяет выбранный, старый освобождается', () => {
			const { state, options } = setup({ getIsMultiple: () => false, getMaxCount: () => 1 })
			state.addFiles([image('a.png')])
			const [first] = state.uploadedFiles.value
			state.addFiles([doc('b.pdf'), doc('c.pdf')])

			expect(state.uploadedFiles.value.map(file => file.name)).toEqual(['b.pdf'])
			expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a.png#1')
			expect(options.onRemove).toHaveBeenCalledWith(first)
			expect(options.onChange).toHaveBeenLastCalledWith([state.uploadedFiles.value[0].file])
		})

		it('невалидный файл выбранный не вытесняет', () => {
			const { state, options } = setup({ getIsMultiple: () => false, getAccept: () => '.pdf' })
			state.addFiles([doc('a.pdf')])
			state.addFiles([image('b.png')])

			expect(state.uploadedFiles.value.map(file => file.name)).toEqual(['a.pdf'])
			expect(options.onChange).toHaveBeenCalledTimes(1)
			expect(state.hasError.value).toBe(true)
		})

		it('замена отменяет загрузку прежнего файла', async () => {
			const { uploader, calls } = deferredUploader()
			const onUploadSuccess = vi.fn()
			const { state } = setup({ getIsMultiple: () => false, getUploader: () => uploader, onUploadSuccess })
			state.addFiles([doc('a.pdf')])
			await flush()
			state.addFiles([doc('b.pdf')])
			await flush()

			expect(calls[0].context.signal.aborted).toBe(true)
			calls[0].resolve('old')
			await flush()
			expect(onUploadSuccess).not.toHaveBeenCalled()
			expect(state.uploadedFiles.value[0].status).toBe('uploading')
		})
	})

	describe('загрузка через uploader', () => {
		it('прогресс и итог — только из uploader: uploading → onProgress → done', async () => {
			const { uploader, calls } = deferredUploader()
			const onUploadSuccess = vi.fn()
			const { state } = setup({ getUploader: () => uploader, onUploadSuccess })
			state.addFiles([doc('a.pdf')])
			const item = state.uploadedFiles.value[0]
			expect(item.status).toBe('uploading')
			await flush()

			expect(uploader).toHaveBeenCalledWith(item.file, expect.objectContaining({ signal: expect.any(AbortSignal) }))
			calls[0].context.onProgress(42.4)
			expect(state.uploadedFiles.value[0].progress).toBe(42)
			calls[0].context.onProgress(250)
			expect(state.uploadedFiles.value[0].progress).toBe(100)
			calls[0].context.onProgress(-5)
			expect(state.uploadedFiles.value[0].progress).toBe(0)
			calls[0].context.onProgress(Number.NaN)
			expect(state.uploadedFiles.value[0].progress).toBe(0)

			calls[0].resolve({ id: 7 })
			await flush()
			expect(state.uploadedFiles.value[0]).toMatchObject({ status: 'done', progress: 100 })
			expect(onUploadSuccess).toHaveBeenCalledWith(state.uploadedFiles.value[0], { id: 7 })
			expect(state.announcement.value).toBe(formatMessage(UI_FILE_UPLOAD.UPLOADED, { name: 'a.pdf' }))

			calls[0].context.onProgress(10)
			expect(state.uploadedFiles.value[0].progress).toBe(100)
		})

		it('ошибка uploader: статус error, текст ошибки, событие и объявление', async () => {
			const { uploader, calls } = deferredUploader()
			const onUploadError = vi.fn()
			const { state } = setup({ getUploader: () => uploader, onUploadError })
			state.addFiles([doc('a.pdf')])
			await flush()
			calls[0].reject(new Error('Сервер недоступен'))
			await flush()

			const [item] = state.uploadedFiles.value
			expect(item).toMatchObject({ status: 'error', error: 'Сервер недоступен' })
			expect(onUploadError).toHaveBeenCalledWith(item, 'Сервер недоступен')
			expect(state.announcement.value).toBe(
				formatMessage(UI_FILE_UPLOAD.UPLOAD_FAILED, { name: 'a.pdf', message: 'Сервер недоступен' }),
			)
		})

		it.each([
			['строка', 'Нет места', 'Нет места'],
			['Error без текста', new Error(''), undefined],
			['пустая строка', '', undefined],
			['иное значение', { code: 500 }, undefined],
		])('текст ошибки из отклонения: %s', async (_case, reason, expected) => {
			const { uploader, calls } = deferredUploader()
			const { state } = setup({ getUploader: () => uploader })
			state.addFiles([doc('a.pdf')])
			await flush()
			calls[0].reject(reason)
			await flush()
			expect(state.uploadedFiles.value[0].error).toBe(expected ?? UI_FILE_UPLOAD.UPLOAD_ERROR)
		})

		it('синхронное исключение uploader — тоже ошибка загрузки', async () => {
			const uploader = vi.fn(() => {
				throw new Error('boom')
			})
			const { state } = setup({ getUploader: () => uploader })
			state.addFiles([doc('a.pdf')])
			await flush()
			expect(state.uploadedFiles.value[0]).toMatchObject({ status: 'error', error: 'boom' })
		})

		it('итог без колбэков событий не падает', async () => {
			const { uploader, calls } = deferredUploader()
			const { state } = setup({ getUploader: () => uploader })
			state.addFiles([doc('a.pdf'), doc('b.pdf')])
			await flush()
			calls[0].resolve(null)
			calls[1].reject(new Error('x'))
			await flush()
			expect(state.uploadedFiles.value.map(file => file.status)).toEqual(['done', 'error'])
		})

		it('retry повторяет только файл со статусом error', async () => {
			const { uploader, calls } = deferredUploader()
			const { state } = setup({ getUploader: () => uploader })
			state.addFiles([doc('a.pdf'), doc('b.pdf')])
			await flush()
			calls[0].reject(new Error('x'))
			await flush()

			state.retry(state.uploadedFiles.value[1])
			expect(uploader).toHaveBeenCalledTimes(2)

			state.retry(state.uploadedFiles.value[0])
			expect(state.uploadedFiles.value[0]).toMatchObject({ status: 'uploading', progress: 0, error: undefined })
			await flush()
			expect(uploader).toHaveBeenCalledTimes(3)
			calls[2].resolve('ok')
			await flush()
			expect(state.uploadedFiles.value[0].status).toBe('done')
		})

		it('retry удалённого файла ничего не делает', async () => {
			const { uploader, calls } = deferredUploader()
			const { state } = setup({ getUploader: () => uploader })
			state.addFiles([doc('a.pdf')])
			await flush()
			calls[0].reject(new Error('x'))
			await flush()
			const [item] = state.uploadedFiles.value
			state.handleRemove(item)
			state.retry(item)
			await flush()
			expect(uploader).toHaveBeenCalledTimes(1)
		})

		it('удаление во время загрузки отменяет её, поздний итог и прогресс игнорируются', async () => {
			const { uploader, calls } = deferredUploader()
			const onUploadSuccess = vi.fn()
			const { state, options } = setup({ getUploader: () => uploader, onUploadSuccess })
			state.addFiles([image('a.png')])
			await flush()
			const [item] = state.uploadedFiles.value
			state.handleRemove(item)

			expect(calls[0].context.signal.aborted).toBe(true)
			expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a.png#1')
			expect(options.onRemove).toHaveBeenCalledWith(item)
			expect(options.onChange).toHaveBeenLastCalledWith([])
			calls[0].context.onProgress(50)
			calls[0].resolve('late')
			await flush()
			expect(onUploadSuccess).not.toHaveBeenCalled()
		})

		it('файл, исчезнувший из списка без отмены, итог не получает', async () => {
			const { uploader, calls } = deferredUploader()
			const onUploadSuccess = vi.fn()
			const { state } = setup({ getUploader: () => uploader, onUploadSuccess })
			state.addFiles([doc('a.pdf')])
			await flush()
			state.uploadedFiles.value = []
			calls[0].context.onProgress(30)
			calls[0].resolve('late')
			await flush()
			expect(onUploadSuccess).not.toHaveBeenCalled()
		})
	})

	describe('очистка и размонтирование', () => {
		it('clear очищает список и ошибки, отменяет загрузки и сообщает пустой список', async () => {
			const { uploader, calls } = deferredUploader()
			const { state, options } = setup({ getUploader: () => uploader, getMaxCount: () => 1 })
			state.addFiles([image('a.png'), doc('b.pdf')])
			await flush()
			expect(state.hasError.value).toBe(true)

			state.clear()
			expect(state.uploadedFiles.value).toEqual([])
			expect(state.hasError.value).toBe(false)
			expect(calls[0].context.signal.aborted).toBe(true)
			expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a.png#1')
			expect(options.onRemove).toHaveBeenCalledTimes(1)
			expect(options.onChange).toHaveBeenLastCalledWith([])
		})

		it('clear пустого списка change не шлёт', () => {
			const { state, options } = setup()
			state.clear()
			expect(options.onChange).not.toHaveBeenCalled()
		})

		it('размонтирование отменяет загрузки, освобождает превью и не принимает новые файлы', async () => {
			const { uploader, calls } = deferredUploader()
			const { state, wrapper, options } = setup({ getUploader: () => uploader })
			state.addFiles([image('a.png'), doc('b.pdf')])
			await flush()
			wrapper.unmount()

			expect(calls.every(call => call.context.signal.aborted)).toBe(true)
			expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a.png#1')
			expect(options.onRemove).not.toHaveBeenCalled()
			state.addFiles([doc('c.pdf')])
			expect(state.uploadedFiles.value).toHaveLength(2)
		})
	})

	describe('перетаскивание', () => {
		it('подсвечивает зону при наведении и снимает подсветку при уходе', () => {
			const { state } = setup()
			state.handleDragOver()
			expect(state.isDragOver.value).toBe(true)
			state.handleDragLeave()
			expect(state.isDragOver.value).toBe(false)
		})

		it('бросок файлов добавляет их', () => {
			const { state, options } = setup()
			state.handleDragOver()
			const files = [doc('a.pdf')]
			state.handleDrop({ dataTransfer: { files } } as unknown as DragEvent)
			expect(options.onChange).toHaveBeenCalledWith(files)
			expect(state.isDragOver.value).toBe(false)
		})

		it('бросок без файлов только снимает подсветку', () => {
			const { state, options } = setup()
			state.handleDragOver()
			state.handleDrop({ dataTransfer: null } as unknown as DragEvent)
			expect(state.isDragOver.value).toBe(false)
			expect(options.onChange).not.toHaveBeenCalled()
		})
	})
})
