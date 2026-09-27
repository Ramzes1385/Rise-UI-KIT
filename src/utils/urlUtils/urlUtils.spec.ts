import { DOWNLOAD_PROTOCOLS, isSafeUrl } from './urlUtils'

describe('urlUtils.isSafeUrl', () => {
	it.each([
		'https://example.com/page',
		'http://example.com',
		'mailto:team@example.com',
		'tel:+79990000000',
		'/catalog/item?id=1',
		'./relative',
		'../up',
		'#anchor',
		'?q=1',
		'//cdn.example.com/file',
		'  https://example.com/page  ',
		'/path\t\n',
	])('разрешает %j', url => {
		expect(isSafeUrl(url)).toBe(true)
	})

	it.each([
		'javascript:alert(1)',
		'JaVaScRiPt:alert(1)',
		'  javascript:alert(1)',
		'java\tscript:alert(1)',
		'java\nscript:alert(1)',
		'\u0000javascript:alert(1)',
		'vbscript:msgbox(1)',
		'data:text/html,<script>alert(1)</script>',
		'blob:https://example.com/uuid',
		' javascript:alert(1) \u0000',
	])('отклоняет %j', url => {
		expect(isSafeUrl(url)).toBe(false)
	})

	it('отклоняет пустую строку и не-строки', () => {
		expect(isSafeUrl('')).toBe(false)
		expect(isSafeUrl('   ')).toBe(false)
		expect(isSafeUrl(undefined as unknown as string)).toBe(false)
	})

	it('для скачивания допускает blob: и data:, но не javascript:', () => {
		expect(isSafeUrl('blob:https://example.com/uuid', DOWNLOAD_PROTOCOLS)).toBe(true)
		expect(isSafeUrl('data:text/plain;base64,SGk=', DOWNLOAD_PROTOCOLS)).toBe(true)
		expect(isSafeUrl('javascript:alert(1)', DOWNLOAD_PROTOCOLS)).toBe(false)
		expect(isSafeUrl('mailto:a@b.c', DOWNLOAD_PROTOCOLS)).toBe(false)
	})
})
