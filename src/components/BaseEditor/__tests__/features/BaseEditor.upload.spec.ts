import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import BaseEditor from '../../ui/BaseEditor.vue'
import type { EditorUploadMedia } from '../../types/BaseEditor.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const stubs = { BaseTooltip: { template: '<div class="tooltip-stub"><slot /></div>' } }

interface Deferred {
	resolve: (value: Awaited<ReturnType<EditorUploadMedia>>) => void
	reject: (reason: unknown) => void
	signal: AbortSignal
	file: File
}

function createUpload() {
	const calls: Deferred[] = []
	const uploadMedia: EditorUploadMedia = (file, { signal }) =>
		new Promise((resolve, reject) => {
			calls.push({ resolve, reject, signal, file })
		})
	return { calls, uploadMedia: vi.fn(uploadMedia) }
}

const png = (name = 'a.png'): File => new File(['x'], name, { type: 'image/png' })
const mp4 = (name = 'a.mp4'): File => new File(['x'], name, { type: 'video/mp4' })
const text = (): File => new File(['x'], 'a.txt', { type: 'text/plain' })

function transferEvent(inputType: string, files: File[]): InputEvent {
	const event = new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType })
	Object.defineProperty(event, 'dataTransfer', { value: { files, getData: () => '' } })
	return event
}

async function pickFile(accept: string, file: File | null): Promise<void> {
	const input = document.querySelector<HTMLInputElement>(`input[type="file"][accept="${accept}"]`) as HTMLInputElement
	Object.defineProperty(input, 'files', { value: file ? [file] : [], configurable: true })
	await fireEvent.change(input)
}

function emitted(wrapper: ReturnType<typeof render>): string[] {
	return ((wrapper.emitted('update:modelValue') ?? []) as string[][]).map(args => args[0])
}

const undoButton = (): HTMLElement => screen.getByRole('button', { name: 'Отменить' })

function setup(props: Record<string, unknown> = {}) {
	const upload = createUpload()
	const wrapper = render(BaseEditor, {
		props: { modelValue: '<p>Текст</p>', uploadMedia: upload.uploadMedia, ...props },
		global: { stubs },
	})
	return { ...upload, wrapper, textbox: screen.getByRole('textbox') }
}

describe('BaseEditor: загрузка медиа (uploadMedia)', () => {
	beforeEach(() => {
		vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:own')
	})

	afterEach(() => {
		vi.restoreAllMocks()
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	it('кнопка «Изображение»: заглушка с aria-busy, не попадает в значение, затем img с адресом приложения', async () => {
		const { calls, textbox, wrapper } = setup()

		await pickFile('image/*', png())
		const placeholder = textbox.querySelector('[data-editor-upload]')

		expect(placeholder).toHaveAttribute('aria-busy', 'true')
		expect(placeholder).toHaveAttribute('aria-label', 'Загрузка файла')
		expect(placeholder).toHaveAttribute('contenteditable', 'false')
		expect(textbox.closest('.base-editor__frame')).toHaveAttribute('aria-busy', 'true')
		expect(emitted(wrapper).every(value => !value.includes('data-editor-upload'))).toBe(true)
		expect(URL.createObjectURL).not.toHaveBeenCalled()

		calls[0].resolve('https://cdn.example.com/a.png')
		await waitFor(() => expect(textbox.querySelector('img')).not.toBeNull())

		expect(textbox.querySelector('[data-editor-upload]')).toBeNull()
		expect(textbox.querySelector('img')).toHaveAttribute('src', 'https://cdn.example.com/a.png')
		expect(textbox.querySelector('img')).toHaveAttribute('alt', '')
		expect(emitted(wrapper).at(-1)).toContain('https://cdn.example.com/a.png')
		await waitFor(() => expect(textbox.closest('.base-editor__frame')).not.toHaveAttribute('aria-busy'))
	})

	it('после успеха в истории один шаг: отмена убирает изображение целиком, повтор возвращает', async () => {
		const { calls, textbox } = setup()
		await pickFile('image/*', png())
		calls[0].resolve({ src: 'https://cdn.example.com/b.png', alt: 'Схема "А"' })
		await waitFor(() => expect(textbox.querySelector('img')).not.toBeNull())
		expect(textbox.querySelector('img')).toHaveAttribute('alt', 'Схема "А"')

		await fireEvent.click(undoButton())
		expect(textbox.innerHTML).toBe('<p>Текст</p>')
		expect(undoButton()).toHaveAttribute('aria-disabled', 'true')

		await fireEvent.click(screen.getByRole('button', { name: 'Повторить' }))
		expect(textbox.querySelector('img')).toHaveAttribute('src', 'https://cdn.example.com/b.png')
	})

	it('видео с кнопки «Видео» вставляется тегом video с адресом приложения', async () => {
		const { calls, textbox } = setup()

		await pickFile('video/*', mp4())
		calls[0].resolve('https://cdn.example.com/a.mp4')
		await waitFor(() => expect(textbox.querySelector('video')).not.toBeNull())

		expect(textbox.querySelector('video')).toHaveAttribute('src', 'https://cdn.example.com/a.mp4')
		expect(textbox.querySelector('video')).toHaveAttribute('controls')
	})

	it('ошибка: заглушка убрана без шага в истории, сообщение с role=alert и событие upload-error', async () => {
		const { calls, textbox, wrapper } = setup()
		await pickFile('image/*', png('схема.png'))
		const cause = new Error('413')

		calls[0].reject(cause)
		await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

		expect(screen.getByRole('alert')).toHaveTextContent('Не удалось загрузить файл «схема.png»')
		expect(textbox.innerHTML).toBe('<p>Текст</p>')
		expect(undoButton()).toHaveAttribute('aria-disabled', 'true')
		expect(wrapper.emitted('upload-error')).toEqual([[{ file: calls[0].file, error: cause }]])

		await pickFile('image/*', png())
		expect(screen.queryByRole('alert')).toBeNull()
	})

	it('небезопасный адрес в ответе — ошибка загрузки, ничего не вставлено', async () => {
		const { calls, textbox, wrapper } = setup()
		await pickFile('image/*', png())

		calls[0].resolve('javascript:alert(1)')
		await waitFor(() => expect(wrapper.emitted('upload-error')).toHaveLength(1))

		expect(textbox.querySelector('img')).toBeNull()
		expect(textbox.querySelector('[data-editor-upload]')).toBeNull()
	})

	it('пока файл грузится, набор текста не теряется: заглушка заменяется на месте, отдельными шагами', async () => {
		const { calls, textbox } = setup()
		await pickFile('image/*', png())
		textbox.querySelector('p')!.append('!')
		await fireEvent.input(textbox)

		calls[0].resolve('https://cdn.example.com/c.png')
		await waitFor(() => expect(textbox.querySelector('img')).not.toBeNull())

		expect(textbox.textContent).toBe('Текст!')
		await fireEvent.click(undoButton())
		expect(textbox.querySelector('img')).toBeNull()
		expect(textbox.textContent).toBe('Текст!')
	})

	it('ошибка после набора убирает заглушку, текст остаётся', async () => {
		const { calls, textbox } = setup()
		await pickFile('image/*', png())
		textbox.querySelector('p')!.append('!')
		await fireEvent.input(textbox)

		calls[0].reject(new Error('x'))
		await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())

		expect(textbox.querySelector('[data-editor-upload]')).toBeNull()
		expect(textbox.textContent).toBe('Текст!')
	})

	it('вставка из буфера: файлы изображений и видео грузятся, событие отменяется; другие файлы — нет', async () => {
		const { calls, textbox } = setup()
		const paste = transferEvent('insertFromPaste', [png(), mp4(), text()])

		textbox.dispatchEvent(paste)
		await nextTick()

		expect(paste.defaultPrevented).toBe(true)
		expect(calls.map(call => call.file.name)).toEqual(['a.png', 'a.mp4'])
		expect(textbox.querySelectorAll('[data-editor-upload]')).toHaveLength(2)

		const other = transferEvent('insertFromPaste', [text()])
		textbox.dispatchEvent(other)
		expect(other.defaultPrevented).toBe(false)
		expect(calls).toHaveLength(2)
	})

	it('перетаскивание файла: заглушка на месте отпускания, внутреннее перетаскивание не затрагивается', async () => {
		const { calls, textbox } = setup()
		const drop = transferEvent('insertFromDrop', [png()])
		Object.defineProperty(drop, 'getTargetRanges', { value: () => [] })

		textbox.dispatchEvent(drop)
		await nextTick()

		expect(drop.defaultPrevented).toBe(true)
		expect(calls).toHaveLength(1)

		await fireEvent.dragStart(textbox)
		const internal = transferEvent('insertFromDrop', [png()])
		textbox.dispatchEvent(internal)
		expect(internal.defaultPrevented).toBe(false)
		expect(calls).toHaveLength(1)
	})

	it('перетаскивание без файлов и без HTML не перехватывается', async () => {
		const { calls, textbox } = setup()
		const drop = transferEvent('insertFromDrop', [])

		textbox.dispatchEvent(drop)

		expect(drop.defaultPrevented).toBe(false)
		expect(calls).toHaveLength(0)
	})

	it('при размонтировании загрузка отменяется, поздний ответ игнорируется', async () => {
		const { calls, wrapper } = setup()
		await pickFile('image/*', png())

		wrapper.unmount()
		expect(calls[0].signal.aborted).toBe(true)
		calls[0].resolve('https://cdn.example.com/late.png')
		await nextTick()

		expect(wrapper.emitted('upload-error')).toBeUndefined()
	})

	it('отклонение после отмены не считается ошибкой', async () => {
		const { calls, wrapper } = setup()
		await pickFile('image/*', png())

		wrapper.unmount()
		calls[0].reject(new DOMException('aborted', 'AbortError'))
		await nextTick()

		expect(wrapper.emitted('upload-error')).toBeUndefined()
	})

	it('значение, пришедшее снаружи, убирает заглушку: ответ отбрасывается без ошибки', async () => {
		const { calls, textbox, wrapper } = setup()
		await pickFile('image/*', png())

		await wrapper.rerender({ modelValue: '<p>Другое</p>' })
		calls[0].resolve('https://cdn.example.com/d.png')
		await nextTick()
		await nextTick()

		expect(textbox.innerHTML).toBe('<p>Другое</p>')
		expect(wrapper.emitted('upload-error')).toBeUndefined()
	})

	it('режим только для чтения во время загрузки: заглушка убирается, изображение не вставляется', async () => {
		const { calls, textbox, wrapper } = setup()
		await pickFile('image/*', png())

		await wrapper.rerender({ isReadonly: true })
		calls[0].resolve('https://cdn.example.com/e.png')
		await waitFor(() => expect(textbox.querySelector('[data-editor-upload]')).toBeNull())

		expect(textbox.querySelector('img')).toBeNull()
		expect(wrapper.emitted('upload-error')).toBeUndefined()
	})

	it('режим кода: ответ вставляется разметкой в поле кода, ошибка показывает сообщение', async () => {
		const { calls, wrapper } = setup()
		await fireEvent.click(screen.getByRole('button', { name: 'Режим кода' }))
		await pickFile('image/*', png())
		const code = screen.getByRole('textbox', { name: 'HTML-код' }) as HTMLTextAreaElement

		calls[0].resolve('https://cdn.example.com/f.png')
		await waitFor(() => expect(code.value).toContain('https://cdn.example.com/f.png'))

		await pickFile('image/*', png('g.png'))
		calls[1].reject(new Error('x'))
		await waitFor(() => expect(wrapper.emitted('upload-error')).toHaveLength(1))
		expect(screen.getByRole('alert')).toHaveTextContent('g.png')
	})

	it('без uploadMedia кнопка вставляет blob:, а вставка файлов не перехватывается', async () => {
		const wrapper = render(BaseEditor, { props: { modelValue: '<p>Текст</p>' }, global: { stubs } })
		const textbox = screen.getByRole('textbox')

		await pickFile('image/*', png())
		expect(textbox.querySelector('img')).toHaveAttribute('src', 'blob:own')

		const paste = transferEvent('insertFromPaste', [png()])
		textbox.dispatchEvent(paste)
		expect(paste.defaultPrevented).toBe(false)
		expect(wrapper.emitted('upload-error')).toBeUndefined()
	})

	it('пустой выбор файла ничего не запускает', async () => {
		const { uploadMedia } = setup()

		await pickFile('image/*', null)

		expect(uploadMedia).not.toHaveBeenCalled()
	})
})
