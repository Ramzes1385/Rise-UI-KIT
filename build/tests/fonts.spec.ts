/**
 * Шрифты кита (src/styles/fonts, README «Шрифты»): каждый знак словарей кита и подписей клавиш BaseKbd рисует шрифт кита — его
 * есть в файле шрифта (таблица cmap) и в unicode-range его @font-face, — а не системный запасной. Новый знак в словаре, которого
 * нет в подмножестве, — пересобрать шрифты: build/fonts/build_fonts.py.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { brotliDecompressSync } from 'node:zlib'
import { CJK_FONTS, createLocaleFontEntries } from '../plugins/fonts'

const ROOT = resolve(import.meta.dirname, '../..')
const FONTS = join(ROOT, 'src/styles/fonts')

/** Таблицы WOFF2 с известным тегом: номер в списке — 6 младших бит флага в каталоге таблиц (спецификация WOFF2, 5.1) */
// prettier-ignore
const KNOWN_TAGS = [
	'cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca', 'prep', 'CFF ', 'VORG', 'EBDT',
	'EBLC', 'gasp', 'hdmx', 'kern', 'LTSH', 'PCLT', 'VDMX', 'vhea', 'vmtx', 'BASE', 'GDEF', 'GPOS', 'GSUB', 'EBSC', 'JSTF', 'MATH',
	'CBDT', 'CBLC', 'COLR', 'CPAL', 'SVG ', 'sbix', 'acnt', 'avar', 'bdat', 'bloc', 'bsln', 'cvar', 'fdsc', 'feat', 'fmtx', 'fvar',
	'gvar', 'hsty', 'just', 'lcar', 'mort', 'morx', 'opbd', 'prop', 'trak', 'Zapf', 'Silf', 'Glat', 'Gloc', 'Feat', 'Sill',
]

function readBase128(data: Buffer, start: number): [number, number] {
	let value = 0
	for (let index = 0; index < 5; index++) {
		const byte = data[start + index]!
		value = value * 128 + (byte & 0x7f)
		if ((byte & 0x80) === 0) return [value, start + index + 1]
	}
	throw new Error('WOFF2: неверное число UIntBase128')
}

/** Коды знаков подтаблицы cmap формата 4 (BMP) или 12 (все плоскости) */
function cmapCodepoints(table: Buffer): Set<number> {
	const records = Array.from({ length: table.readUInt16BE(2) }, (_, index) => ({
		platform: table.readUInt16BE(4 + index * 8),
		encoding: table.readUInt16BE(6 + index * 8),
		offset: table.readUInt32BE(8 + index * 8),
	}))
	const best =
		records.find(({ platform, encoding }) => platform === 3 && encoding === 10) ?? records.find(({ platform }) => platform === 3)
	const sub = table.subarray(best!.offset)
	const codepoints = new Set<number>()
	if (sub.readUInt16BE(0) === 12) {
		for (let group = 0; group < sub.readUInt32BE(12); group++) {
			for (let cp = sub.readUInt32BE(16 + group * 12); cp <= sub.readUInt32BE(20 + group * 12); cp++) codepoints.add(cp)
		}
		return codepoints
	}
	const segments = sub.readUInt16BE(6) / 2
	for (let segment = 0; segment < segments; segment++) {
		const end = sub.readUInt16BE(14 + segment * 2)
		const start = sub.readUInt16BE(16 + segments * 2 + segment * 2)
		const delta = sub.readInt16BE(16 + segments * 4 + segment * 2)
		const rangeAt = 16 + segments * 6 + segment * 2
		const rangeOffset = sub.readUInt16BE(rangeAt)
		for (let cp = start; cp <= end && cp !== 0xffff; cp++) {
			const glyph = rangeOffset === 0 ? cp : sub.readUInt16BE(rangeAt + rangeOffset + (cp - start) * 2)
			if (glyph !== 0 && ((glyph + delta) & 0xffff) !== 0) codepoints.add(cp)
		}
	}
	return codepoints
}

/** Коды знаков файла WOFF2: таблица cmap в WOFF2 не преобразуется — она лежит в распакованном потоке таблиц как есть */
function woff2Codepoints(file: string): Set<number> {
	const data = readFileSync(file)
	if (data.toString('latin1', 0, 4) !== 'wOF2') throw new Error(`${file}: не WOFF2`)
	let offset = 48
	let position = 0
	let cmap: [number, number] | null = null
	for (let index = 0; index < data.readUInt16BE(12); index++) {
		const flags = data[offset++]!
		const custom = (flags & 0x3f) === 63
		const tag = custom ? data.toString('latin1', offset, offset + 4) : KNOWN_TAGS[flags & 0x3f]
		if (custom) offset += 4
		let length = 0
		;[length, offset] = readBase128(data, offset)
		const transformed = tag === 'glyf' || tag === 'loca' ? flags >> 6 === 0 : flags >> 6 !== 0
		if (transformed) [length, offset] = readBase128(data, offset)
		if (tag === 'cmap') cmap = [position, length]
		position += length
	}
	const tables = brotliDecompressSync(data.subarray(offset, offset + data.readUInt32BE(20)))
	return cmapCodepoints(tables.subarray(cmap![0], cmap![0] + cmap![1]))
}

function parseRange(range: string): [number, number][] {
	return range.split(',').map(token => {
		const [start, end = start] = token.trim().replace(/^U\+/i, '').split('-')
		return [parseInt(start!, 16), parseInt(end!, 16)]
	})
}

/** Знаки, которые рисует семейство: у каждого @font-face — коды его файла в пределах unicode-range */
function familyCoverage(cssFiles: string[], family: string): Set<number> {
	const covered = new Set<number>()
	for (const cssFile of cssFiles) {
		for (const [, body] of readFileSync(cssFile, 'utf8').matchAll(/@font-face\s*\{([^}]*)\}/g)) {
			if (!new RegExp(`font-family:\\s*['"]${family}['"]`).test(body!)) continue
			const url = /url\('([^'?]+)/.exec(body!)![1]!
			const ranges = /unicode-range:\s*([^;]+);/.exec(body!)?.[1]
			const inRange = (cp: number) => !ranges || parseRange(ranges).some(([start, end]) => cp >= start && cp <= end)
			for (const cp of woff2Codepoints(resolve(dirname(cssFile), url))) if (inRange(cp)) covered.add(cp)
		}
	}
	return covered
}

function filesIn(dir: string, extension: string): string[] {
	return readdirSync(dir, { recursive: true })
		.map(file => join(dir, String(file)))
		.filter(file => file.endsWith(extension))
}

/** Знаки исходников (словари — целиком, с комментариями), кроме управляющих и пробельных */
function sourceChars(files: string[]): Set<number> {
	const chars = new Set<number>()
	for (const file of files)
		for (const char of readFileSync(file, 'utf8')) if (/\S/u.test(char) && char.codePointAt(0)! >= 0x20) chars.add(char.codePointAt(0)!)
	return chars
}

const hex = (cps: Iterable<number>) => [...cps].map(cp => `U+${cp.toString(16).toUpperCase().padStart(4, '0')} ${String.fromCodePoint(cp)}`)

const KIT_FACES = join(FONTS, '_fonts.scss')
const KBD = join(ROOT, 'src/components/BaseKbd/model/useBaseKbd.ts')
/** Шрифты иероглифов: CSS языка (build/plugins/fonts.ts, CJK_FONTS) */
const CJK_FACES = { zh: join(FONTS, 'cjk/zh.css'), ja: join(FONTS, 'cjk/ja.css') }

describe('шрифты кита', () => {
	it.each([KIT_FACES, ...Object.values(CJK_FACES)])('у каждого @font-face в %s есть файл шрифта', cssFile => {
		const urls = [...readFileSync(cssFile, 'utf8').matchAll(/url\('([^'?]+)/g)].map(([, url]) => url!)

		expect(urls.length).toBeGreaterThan(0)
		expect(urls.filter(url => !existsSync(resolve(dirname(cssFile), url)))).toEqual([])
	})

	it.each(['ru', 'en', 'kk', 'uz'])('словарь %s и клавиши BaseKbd — целиком шрифтами Rise Grotesk и Rise Mono', code => {
		const chars = sourceChars([...filesIn(join(ROOT, 'src/locales', code), '.ts'), KBD])

		for (const family of ['Rise Grotesk', 'Rise Mono']) {
			const covered = familyCoverage([KIT_FACES], family)
			expect({ family, missing: hex([...chars].filter(cp => !covered.has(cp))) }).toEqual({ family, missing: [] })
		}
	})

	it.each([
		['zh', 'Rise CJK SC'],
		['ja', 'Rise CJK JP'],
	] as const)('словарь %s — целиком шрифтами кита и %s: и основным, и моноширинным стеком', (code, cjk) => {
		const chars = sourceChars(filesIn(join(ROOT, 'src/locales', code), '.ts'))
		const ideographs = familyCoverage([CJK_FACES[code]], cjk)

		for (const family of ['Rise Grotesk', 'Rise Mono']) {
			const covered = new Set([...familyCoverage([KIT_FACES], family), ...ideographs])
			expect({ family, missing: hex([...chars].filter(cp => !covered.has(cp))) }).toEqual({ family, missing: [] })
		}
	})
})

describe('шрифт иероглифов приходит со словарём с подпути', () => {
	const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { exports: Record<string, unknown>; sideEffects: string[] }

	it.each(CJK_FONTS)(
		'словарь $code — подпуть /locales/$code (вход сборки с CSS шрифта), только шрифт — /fonts/$code.css',
		({ code, css }) => {
			expect(createLocaleFontEntries()).toHaveProperty([`locales/${code}`])
			expect(pkg.exports[`./locales/${code}`]).toEqual({
				types: `./dist/locales/${code}/index.d.ts`,
				import: `./dist/locales/${code}.js`,
			})
			expect(pkg.exports[`./fonts/${code}.css`]).toEqual({
				types: './dist/styles.d.ts',
				import: `./dist/fonts/${css}`,
				default: `./dist/fonts/${css}`,
			})
		},
	)

	it('вход словаря — с побочным эффектом (sideEffects): иначе сборщик приложения обойдёт реэкспорт вместе с импортом CSS шрифта', () => {
		expect(pkg.sideEffects).toContain('./dist/locales/*.js')
	})

	it('в корне пакета словарей zh и ja нет: оттуда приложение получило бы словарь без шрифта', () => {
		const source = readFileSync(join(ROOT, 'src/index.ts'), 'utf8')
		const exported = /export \{([^}]*)\} from '\.\/locales'/
			.exec(source)![1]!
			.split(',')
			.map(name => name.trim())

		expect(exported).toContain('registerLocale')
		expect(exported.filter(name => CJK_FONTS.some(({ code }) => code === name))).toEqual([])
	})
})
