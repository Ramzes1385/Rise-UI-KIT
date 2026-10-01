import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { UI_TEXT } from '@/locales/messages'
import { useFileUploadState } from '../useFileUploadState'
import type { UseFileUploadStateOptions } from '../types/useFileUploadState.types'

/** Чтение превью управляется тестом: так видно и обычное, и «устаревшее» чтение */
const previews = vi.hoisted(() => ({ pending: [] as { file: File; resolve: (url: string | null) => void }[], isManual: false }))

vi.mock('@utils/media/fileUtils', async importOriginal => {
	const actual = await importOriginal<typeof import('@utils/media/fileUtils')>()
	return {
		...actual,
		createImagePreview: (file: File) =>
			new Promise<string | null>(resolve => {
				const url = file.type.startsWith('image/') ? `blob:${file.name}` : null
				if (previews.isManual) previews.pending.push({ file, resolve: () => resolve(url) })
				else resolve(url)
			}),
	}
})

const image = (name: string, size = 10) => new File(['x'.repeat(size)], name, { type: 'image/png' })
const doc = (name: string) => new File(['doc'], name, { type: 'application/pdf' })

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

describe('useFileUploadState', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.stubGlobal('URL', { ...URL, revokeObjectURL: vi.fn() })
		previews.isManual = false
		previews.pending.length = 0
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
		vi.unstubAllGlobals()
	})

	describe('множественный выбор', () => {
		it('добавляет файлы, показывает превью картинок и сообщает о выборе', async () => {
			const { state, options } = setup()
			const files = [image('a.png'), doc('b.pdf')]
			await state.addFiles(files)

			expect(state.uploadedFiles.value.map(file => [file.name, file.extension, file.status, file.previewUrl])).toEqual([
				['a.png', 'png', 'uploading', 'blob:a.png'],
				['b.pdf', 'pdf', 'pending', null],
			])
			expect(options.onChange).toHaveBeenCalledWith(files)
			expect(state.hasError.value).toBe(false)
		})

		it('картинка «загружается» по шагам до 100%', async () => {
			const { state } = setup()
			await state.addFiles([image('a.png')])
			const [item] = state.uploadedFiles.value

			vi.advanceTimersByTime(200)
			expect(item.progress).toBeGreaterThanOrEqual(5)
			expect(item.progress).toBeLessThan(25)
			vi.advanceTimersByTime(200 * 20)
			expect(item.progress).toBe(100)
			expect(item.status).toBe('done')
			expect(vi.getTimerCount()).toBe(0)
		})

		it('без опции множественного выбора файлы добавляются к выбранным', async () => {
			const { state } = setup()
			await state.addFiles([doc('a.pdf')])
			await state.addFiles([doc('b.pdf')])
			expect(state.uploadedFiles.value.map(file => file.name)).toEqual(['a.pdf', 'b.pdf'])
		})

		it('добавляет не больше maxCount и сообщает о переполнении', async () => {
			const { state, options } = setup({ getMaxCount: () => 2, getIsMultiple: () => true })
			await state.addFiles([doc('a.pdf'), doc('b.pdf'), doc('c.pdf')])
			expect(state.uploadedFiles.value).toHaveLength(2)

			await state.addFiles([doc('d.pdf')])
			const message = `${UI_TEXT.FILE_MAX_COUNT_PREFIX} 2`
			expect(options.onError).toHaveBeenCalledWith(message)
			expect(state.displayErrors.value).toEqual([message])
			expect(state.hasError.value).toBe(true)
		})

		it('отклоняет файлы с неверным размером или форматом и сообщает каждую ошибку', async () => {
			const { state, options } = setup({ getAccept: () => '.pdf' })
			await state.addFiles([image('big.png', 2 * 1024 * 1024), doc('ok.pdf')])

			expect(state.uploadedFiles.value.map(file => file.name)).toEqual(['ok.pdf'])
			expect(state.internalErrors.value).toHaveLength(2)
			expect(options.onError).toHaveBeenCalledTimes(2)
			expect(options.onChange).toHaveBeenCalledWith([state.uploadedFiles.value[0].file])
		})

		it('новый выбор очищает прошлые ошибки', async () => {
			const { state } = setup({ getAccept: () => '.pdf' })
			await state.addFiles([image('a.png')])
			expect(state.hasError.value).toBe(true)
			await state.addFiles([doc('b.pdf')])
			expect(state.hasError.value).toBe(false)
		})
	})

	describe('одиночный выбор', () => {
		it('новый файл заменяет выбранный, старый освобождается', async () => {
			const { state, options } = setup({ getIsMultiple: () => false, getMaxCount: () => 1 })
			await state.addFiles([image('a.png')])
			const [first] = state.uploadedFiles.value
			await state.addFiles([doc('b.pdf'), doc('c.pdf')])

			expect(state.uploadedFiles.value.map(file => file.name)).toEqual(['b.pdf'])
			expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a.png')
			expect(options.onRemove).toHaveBeenCalledWith(first)
			expect(options.onChange).toHaveBeenLastCalledWith([state.uploadedFiles.value[0].file])
		})

		it('невалидный файл выбранный не вытесняет', async () => {
			const { state, options } = setup({ getIsMultiple: () => false, getAccept: () => '.pdf' })
			await state.addFiles([doc('a.pdf')])
			await state.addFiles([image('b.png')])

			expect(state.uploadedFiles.value.map(file => file.name)).toEqual(['a.pdf'])
			expect(options.onChange).toHaveBeenCalledTimes(1)
			expect(state.hasError.value).toBe(true)
		})

		it('результат устаревшего чтения превью отбрасывается', async () => {
			previews.isManual = true
			const { state, options } = setup({ getIsMultiple: () => false })
			const first = state.addFiles([image('a.png')])
			const second = state.addFiles([image('b.png')])

			previews.pending[1].resolve(null)
			await second
			previews.pending[0].resolve(null)
			await first

			expect(state.uploadedFiles.value.map(file => file.name)).toEqual(['b.png'])
			expect(options.onChange).toHaveBeenCalledTimes(1)
		})
	})

	describe('удаление', () => {
		it('удаляет файл, освобождает превью и сообщает об оставшихся', async () => {
			const { state, options } = setup()
			await state.addFiles([image('a.png'), doc('b.pdf')])
			const [picture, file] = state.uploadedFiles.value
			state.handleRemove(picture)

			expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:a.png')
			expect(options.onRemove).toHaveBeenCalledWith(picture)
			expect(options.onChange).toHaveBeenLastCalledWith([file.file])
		})

		it('удалённая во время загрузки картинка останавливает свой прогресс', async () => {
			const { state } = setup()
			await state.addFiles([image('a.png')])
			state.handleRemove(state.uploadedFiles.value[0])

			vi.advanceTimersByTime(200)
			expect(vi.getTimerCount()).toBe(0)
		})

		it('файл без превью удаляется без освобождения ссылки', async () => {
			const { state, options } = setup()
			await state.addFiles([doc('a.pdf')])
			state.handleRemove(state.uploadedFiles.value[0])
			expect(URL.revokeObjectURL).not.toHaveBeenCalled()
			expect(options.onChange).toHaveBeenLastCalledWith([])
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

		it('бросок файлов добавляет их', async () => {
			const { state, options } = setup()
			state.handleDragOver()
			const files = [doc('a.pdf')]
			state.handleDrop({ dataTransfer: { files } } as unknown as DragEvent)
			await vi.waitFor(() => expect(options.onChange).toHaveBeenCalledWith(files))
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

	it('размонтирование останавливает имитацию загрузки', async () => {
		const { state, wrapper } = setup()
		await state.addFiles([image('a.png'), image('b.png')])
		expect(vi.getTimerCount()).toBe(2)
		wrapper.unmount()
		expect(vi.getTimerCount()).toBe(0)
	})
})
