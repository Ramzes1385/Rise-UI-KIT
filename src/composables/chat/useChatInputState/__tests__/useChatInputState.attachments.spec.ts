import { getLocale, pluralize } from '@/locales/state'
import { useChatInputState } from '../useChatInputState'
import type { UseChatInputStateOptions } from '../types/useChatInputState.types'

function makeFile(name: string, type = 'text/plain', sizeBytes = 1): File {
	return new File([new Uint8Array(sizeBytes)], name, { type })
}

function setup(props: UseChatInputStateOptions['props'] = {}) {
	const emit = vi.fn()
	const state = useChatInputState({ props, emit: emit as unknown as UseChatInputStateOptions['emit'] })
	return { state, emit }
}

function pick(state: ReturnType<typeof setup>['state'], files: File[]): HTMLInputElement {
	const input = document.createElement('input')
	input.type = 'file'
	Object.defineProperty(input, 'files', { value: files, configurable: true })
	state.handleFileChange({ target: input } as unknown as Event)
	return input
}

beforeEach(() => {
	vi.spyOn(URL, 'createObjectURL').mockImplementation(file => `blob:${(file as File).name}`)
	vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

describe('useChatInputState: ограничения вложений', () => {
	it('файл не того типа не прикрепляется: событие attach-error, сообщение, attach не эмитится', () => {
		const { state, emit } = setup({ accept: 'image/*' })

		pick(state, [makeFile('doc.pdf', 'application/pdf')])

		expect(emit).toHaveBeenCalledTimes(1)
		expect(emit).toHaveBeenCalledWith('attach-error', [expect.objectContaining({ name: 'doc.pdf', reason: 'type' })])
		expect(state.attachments.value).toEqual([])
		expect(state.attachmentErrors.value).toHaveLength(1)
		expect(state.attachmentErrors.value[0]).toContain('doc.pdf')
	})

	it('слишком большой файл не прикрепляется', () => {
		const { state, emit } = setup({ maxFileSize: 1 })

		pick(state, [makeFile('big.bin', 'application/octet-stream', 2 * 1024 * 1024)])

		expect(emit).toHaveBeenCalledWith('attach-error', [expect.objectContaining({ reason: 'size' })])
		expect(emit).not.toHaveBeenCalledWith('attach', expect.anything())
		expect(state.attachments.value).toEqual([])
	})

	it('лимит числа файлов: принятые уходят в attach, лишние — в attach-error с одним сообщением', () => {
		class FakeDataTransfer {
			private readonly list: File[] = []
			items = { add: (file: File): number => this.list.push(file) }
			get files(): FileList {
				return this.list as unknown as FileList
			}
		}
		vi.stubGlobal('DataTransfer', FakeDataTransfer)
		const { state, emit } = setup({ maxFiles: 1 })
		const files = [makeFile('1.txt'), makeFile('2.txt'), makeFile('3.txt')]

		pick(state, files)

		const attachCall = emit.mock.calls.find(call => call[0] === 'attach')
		expect(Array.from(attachCall![1] as FileList)).toEqual([files[0]])
		expect(emit).toHaveBeenCalledWith('attach-error', [
			expect.objectContaining({ name: '2.txt', reason: 'count' }),
			expect.objectContaining({ name: '3.txt', reason: 'count' }),
		])
		expect(state.attachments.value.map(item => item.name)).toEqual(['1.txt'])
		expect(state.attachmentErrors.value).toEqual([pluralize(getLocale().plural.CHAT_MAX_FILES, 1)])
	})

	it('без отказов attach-error не эмитится, ошибки пусты', () => {
		const { state, emit } = setup({ accept: 'text/*' })

		pick(state, [makeFile('a.txt')])

		expect(emit).not.toHaveBeenCalledWith('attach-error', expect.anything())
		expect(state.attachmentErrors.value).toEqual([])
		expect(state.attachments.value).toHaveLength(1)
	})

	it('dismissAttachmentErrors очищает сообщения', () => {
		const { state } = setup({ accept: 'image/*' })
		pick(state, [makeFile('doc.pdf', 'application/pdf')])

		state.dismissAttachmentErrors()

		expect(state.attachmentErrors.value).toEqual([])
	})

	it('следующий выбор заменяет прежние ошибки', () => {
		const { state } = setup({ accept: 'image/*' })
		pick(state, [makeFile('doc.pdf', 'application/pdf')])

		pick(state, [makeFile('photo.png', 'image/png')])

		expect(state.attachmentErrors.value).toEqual([])
	})

	it('удаление вложения сбрасывает ошибки', () => {
		const { state } = setup({ accept: 'image/*' })
		pick(state, [makeFile('photo.png', 'image/png'), makeFile('doc.pdf', 'application/pdf')])
		expect(state.attachmentErrors.value).toHaveLength(1)

		state.removeAttachment(0)

		expect(state.attachmentErrors.value).toEqual([])
	})

	it('отправка сообщения сбрасывает ошибки', () => {
		const { state } = setup({ accept: 'image/*' })
		pick(state, [makeFile('doc.pdf', 'application/pdf')])
		state.text.value = 'Привет'

		state.handleSend()

		expect(state.attachmentErrors.value).toEqual([])
	})
})
