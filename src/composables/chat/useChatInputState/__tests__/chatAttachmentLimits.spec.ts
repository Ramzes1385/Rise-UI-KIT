import { getLocale, pluralize } from '@/locales/state'
import type { ChatAttachmentRejection } from '@components/BaseChat/types/BaseChat.types'
import { checkAttachments, getRejectionMessages, toFileList } from '../attachments/chatAttachmentLimits'

function makeFile(name: string, type = 'text/plain', sizeBytes = 1): File {
	return new File([new Uint8Array(sizeBytes)], name, { type })
}

function asFileList(files: File[]): FileList {
	return files as unknown as FileList
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('checkAttachments', () => {
	it('без ограничений принимает все файлы', () => {
		const files = [makeFile('a.txt'), makeFile('b.png', 'image/png')]

		const { accepted, rejections } = checkAttachments(files, 0, {})

		expect(accepted).toEqual(files)
		expect(rejections).toEqual([])
	})

	it('отклоняет файл не того типа с причиной type', () => {
		const pdf = makeFile('doc.pdf', 'application/pdf')
		const png = makeFile('photo.png', 'image/png')

		const { accepted, rejections } = checkAttachments([pdf, png], 0, { accept: 'image/*' })

		expect(accepted).toEqual([png])
		expect(rejections).toHaveLength(1)
		expect(rejections[0]).toMatchObject({ name: 'doc.pdf', reason: 'type' })
		expect(rejections[0].message).toContain('doc.pdf')
	})

	it('отклоняет файл больше maxFileSize МБ с причиной size', () => {
		const big = makeFile('big.bin', 'application/octet-stream', 2 * 1024 * 1024)
		const small = makeFile('small.bin', 'application/octet-stream', 10)

		const { accepted, rejections } = checkAttachments([big, small], 0, { maxFileSize: 1 })

		expect(accepted).toEqual([small])
		expect(rejections).toHaveLength(1)
		expect(rejections[0]).toMatchObject({ name: 'big.bin', reason: 'size' })
	})

	it('тип проверяется раньше размера', () => {
		const bigPdf = makeFile('big.pdf', 'application/pdf', 2 * 1024 * 1024)

		const { rejections } = checkAttachments([bigPdf], 0, { accept: 'image/*', maxFileSize: 1 })

		expect(rejections[0].reason).toBe('type')
	})

	it('лишние сверх maxFiles отклоняет с причиной count и одним общим сообщением', () => {
		const files = [makeFile('1.txt'), makeFile('2.txt'), makeFile('3.txt'), makeFile('4.txt')]

		const { accepted, rejections } = checkAttachments(files, 0, { maxFiles: 2 })

		expect(accepted.map(file => file.name)).toEqual(['1.txt', '2.txt'])
		expect(rejections.map(item => [item.name, item.reason])).toEqual([
			['3.txt', 'count'],
			['4.txt', 'count'],
		])
		const expected = pluralize(getLocale().plural.CHAT_MAX_FILES, 2)
		expect(rejections.map(item => item.message)).toEqual([expected, expected])
	})

	it('число уже прикреплённых файлов учитывается в лимите', () => {
		const files = [makeFile('1.txt'), makeFile('2.txt')]

		const { accepted, rejections } = checkAttachments(files, 2, { maxFiles: 3 })

		expect(accepted.map(file => file.name)).toEqual(['1.txt'])
		expect(rejections.map(item => item.name)).toEqual(['2.txt'])
	})

	it('maxFiles 0 отклоняет все файлы', () => {
		const { accepted, rejections } = checkAttachments([makeFile('1.txt')], 0, { maxFiles: 0 })

		expect(accepted).toEqual([])
		expect(rejections).toHaveLength(1)
	})
})

describe('getRejectionMessages', () => {
	it('убирает повторяющиеся сообщения', () => {
		const rejections: ChatAttachmentRejection[] = [
			{ name: 'a', reason: 'count', message: 'Лимит' },
			{ name: 'b', reason: 'count', message: 'Лимит' },
			{ name: 'c', reason: 'type', message: 'Тип' },
		]

		expect(getRejectionMessages(rejections)).toEqual(['Лимит', 'Тип'])
	})

	it('без отказов возвращает пустой список', () => {
		expect(getRejectionMessages([])).toEqual([])
	})
})

describe('toFileList', () => {
	it('когда приняты все файлы, возвращает исходный список', () => {
		const files = [makeFile('a.txt'), makeFile('b.txt')]
		const original = asFileList(files)

		expect(toFileList(files, original)).toBe(original)
	})

	it('без DataTransfer возвращает исходный список', () => {
		vi.stubGlobal('DataTransfer', undefined)
		const files = [makeFile('a.txt'), makeFile('b.txt')]
		const original = asFileList(files)

		expect(toFileList([files[0]], original)).toBe(original)
	})

	it('при частичном приёме собирает список из принятых файлов через DataTransfer', () => {
		class FakeDataTransfer {
			private readonly list: File[] = []
			items = { add: (file: File): number => this.list.push(file) }
			get files(): FileList {
				return this.list as unknown as FileList
			}
		}
		vi.stubGlobal('DataTransfer', FakeDataTransfer)
		const files = [makeFile('a.txt'), makeFile('b.txt')]

		const result = toFileList([files[1]], asFileList(files))

		expect(Array.from(result)).toEqual([files[1]])
	})
})
