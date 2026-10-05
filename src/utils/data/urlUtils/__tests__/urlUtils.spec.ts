import { DOWNLOAD_PROTOCOLS, isEmailFormat, isExternalUrl, isSafeUrl, normalizeLinkUrl } from '../urlUtils'

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

describe('urlUtils.normalizeLinkUrl', () => {
	it.each([
		['example.com', 'https://example.com'],
		['  www.example.com/docs?page=2  ', 'https://www.example.com/docs?page=2'],
		['localhost:3000', 'https://localhost:3000'],
		['example.com:8080/path', 'https://example.com:8080/path'],
		['team@example.com', 'mailto:team@example.com'],
	])('дополняет %j до %j', (input, expected) => {
		expect(normalizeLinkUrl(input)).toBe(expected)
	})

	it.each([
		'https://example.com',
		'http://example.com',
		'mailto:team@example.com',
		'tel:88005553535',
		'/docs',
		'#install',
		'./file',
		'?q=1',
		'javascript:alert(1)',
		'',
	])('не меняет %j', input => {
		expect(normalizeLinkUrl(input)).toBe(input)
	})
})

describe('urlUtils.isExternalUrl', () => {
	it.each(['https://example.com', 'mailto:team@example.com', 'tel:+79990000000', '//cdn.example.com/app.js', '  HTTPS://EXAMPLE.COM'])(
		'%s — адрес вне приложения',
		url => {
			expect(isExternalUrl(url)).toBe(true)
		},
	)

	it.each(['/docs', 'docs/intro', './relative', '#anchor', '?page=2', ''])('%s — путь приложения', url => {
		expect(isExternalUrl(url)).toBe(false)
	})
})

describe('urlUtils.isEmailFormat', () => {
	it('синтаксис адреса почты: имя, @, домен с точкой, без пробелов', () => {
		expect(isEmailFormat('a@b.ru')).toBe(true)
		expect(isEmailFormat('  team@example.com ')).toBe(true)
		expect(isEmailFormat('a@b')).toBe(false)
		expect(isEmailFormat('a b@c.ru')).toBe(false)
		expect(isEmailFormat('@b.ru')).toBe(false)
	})
})
