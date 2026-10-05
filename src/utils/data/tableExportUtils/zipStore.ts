/** Утилиты: архив ZIP без сжатия (метод STORE, APPNOTE 6.3) — контейнер книги XLSX */
import type { PreparedZipEntry, ZipEntry } from './types/tableExportUtils.types'

const LOCAL_SIGNATURE = 0x04034b50
const CENTRAL_SIGNATURE = 0x02014b50
const END_SIGNATURE = 0x06054b50
const VERSION = 20
const UTF8_FLAG = 0x0800
const DOS_DATE_1980_01_01 = 0x21
const LOCAL_HEADER_SIZE = 30
const CENTRAL_HEADER_SIZE = 46
const END_SIZE = 22

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
	let crc = index
	for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
	return crc >>> 0
})

/** Контрольная сумма CRC-32 (многочлен 0xEDB88320), как в ZIP и PNG */
function crc32(data: Uint8Array): number {
	let crc = 0xffffffff
	for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
	return (crc ^ 0xffffffff) >>> 0
}

/** Общая часть локального и центрального заголовка: версия, флаги, метод, время, CRC, размеры, длина имени */
function writeCommon(view: DataView, at: number, entry: PreparedZipEntry): void {
	view.setUint16(at, VERSION, true)
	view.setUint16(at + 2, UTF8_FLAG, true)
	view.setUint16(at + 4, 0, true)
	view.setUint16(at + 6, 0, true)
	view.setUint16(at + 8, DOS_DATE_1980_01_01, true)
	view.setUint32(at + 10, entry.crc, true)
	view.setUint32(at + 14, entry.data.length, true)
	view.setUint32(at + 18, entry.data.length, true)
	view.setUint16(at + 22, entry.name.length, true)
}

function localHeader(entry: PreparedZipEntry): Uint8Array {
	const bytes = new Uint8Array(LOCAL_HEADER_SIZE + entry.name.length)
	const view = new DataView(bytes.buffer)
	view.setUint32(0, LOCAL_SIGNATURE, true)
	writeCommon(view, 4, entry)
	bytes.set(entry.name, LOCAL_HEADER_SIZE)
	return bytes
}

function centralHeader(entry: PreparedZipEntry): Uint8Array {
	const bytes = new Uint8Array(CENTRAL_HEADER_SIZE + entry.name.length)
	const view = new DataView(bytes.buffer)
	view.setUint32(0, CENTRAL_SIGNATURE, true)
	view.setUint16(4, VERSION, true)
	writeCommon(view, 6, entry)
	view.setUint32(42, entry.offset, true)
	bytes.set(entry.name, CENTRAL_HEADER_SIZE)
	return bytes
}

function endRecord(count: number, size: number, offset: number): Uint8Array {
	const bytes = new Uint8Array(END_SIZE)
	const view = new DataView(bytes.buffer)
	view.setUint32(0, END_SIGNATURE, true)
	view.setUint16(8, count, true)
	view.setUint16(10, count, true)
	view.setUint32(12, size, true)
	view.setUint32(16, offset, true)
	return bytes
}

function concat(parts: readonly Uint8Array[]): Uint8Array<ArrayBuffer> {
	const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0))
	parts.reduce((offset, part) => {
		result.set(part, offset)
		return offset + part.length
	}, 0)
	return result
}

/** Архив ZIP из файлов без сжатия: время файлов — 01.01.1980 (одинаковый вход даёт одинаковые байты) */
function createZip(entries: readonly ZipEntry[]): Uint8Array<ArrayBuffer> {
	const encoder = new TextEncoder()
	const locals: Uint8Array[] = []
	const prepared: PreparedZipEntry[] = []
	let offset = 0
	for (const { path, data } of entries) {
		const entry = { name: encoder.encode(path), data, crc: crc32(data), offset }
		const header = localHeader(entry)
		locals.push(header, data)
		prepared.push(entry)
		offset += header.length + data.length
	}
	const central = concat(prepared.map(centralHeader))
	return concat([...locals, central, endRecord(prepared.length, central.length, offset)])
}

export { crc32, createZip }
