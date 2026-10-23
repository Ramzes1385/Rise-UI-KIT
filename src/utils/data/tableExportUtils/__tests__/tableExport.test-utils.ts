import { expect } from 'vitest'
import { crc32 } from '../zipStore'

export interface ZipFile {
	path: string
	data: Uint8Array
	method: number
	flags: number
}

function readLocal(bytes: Uint8Array, offset: number, size: number): Uint8Array {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
	expect(view.getUint32(offset, true)).toBe(0x04034b50)
	const start = offset + 30 + view.getUint16(offset + 26, true) + view.getUint16(offset + 28, true)
	return bytes.subarray(start, start + size)
}

function readCentral(bytes: Uint8Array, view: DataView, at: number): { file: ZipFile; next: number } {
	expect(view.getUint32(at, true)).toBe(0x02014b50)
	const size = view.getUint32(at + 20, true)
	expect(view.getUint32(at + 24, true)).toBe(size)
	const nameLength = view.getUint16(at + 28, true)
	const extra = view.getUint16(at + 30, true) + view.getUint16(at + 32, true)
	const path = new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + nameLength))
	const data = readLocal(bytes, view.getUint32(at + 42, true), size)
	expect(crc32(data)).toBe(view.getUint32(at + 16, true))
	const file = { path, data, method: view.getUint16(at + 10, true), flags: view.getUint16(at + 8, true) }
	return { file, next: at + 46 + nameLength + extra }
}

/** Читает архив ZIP по центральному каталогу и сверяет локальные заголовки и CRC-32 */
export function readZip(bytes: Uint8Array): ZipFile[] {
	const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
	const end = bytes.length - 22
	expect(view.getUint32(end, true)).toBe(0x06054b50)
	const count = view.getUint16(end + 10, true)
	const centralSize = view.getUint32(end + 12, true)
	const centralOffset = view.getUint32(end + 16, true)
	expect(centralOffset + centralSize).toBe(end)
	const files: ZipFile[] = []
	let at = centralOffset
	for (let index = 0; index < count; index++) {
		const { file, next } = readCentral(bytes, view, at)
		files.push(file)
		at = next
	}
	return files
}

/** Разбор CSV по RFC 4180: поля в кавычках, удвоенные кавычки, переводы строк внутри полей */
export function parseCsv(text: string, delimiter: string): string[][] {
	const field = new RegExp(`("(?:[^"]|"")*"|[^"${delimiter}\\r\\n]*)(${delimiter}|\\r\\n)`, 'y')
	const rows: string[][] = []
	let row: string[] = []
	let match: RegExpExecArray | null
	while (field.lastIndex < text.length && (match = field.exec(text))) {
		const [, raw, end] = match
		row.push(raw.startsWith('"') ? raw.slice(1, -1).replace(/""/g, '"') : raw)
		if (end === '\r\n') {
			rows.push(row)
			row = []
		}
	}
	return rows
}
