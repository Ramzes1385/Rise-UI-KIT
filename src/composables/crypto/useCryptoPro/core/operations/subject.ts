/** Утилиты: разбор субъекта сертификата КриптоПро — ФИО, организация, ИНН, ОГРН, СНИЛС по русским, латинским и OID-именам */

const FIELDS = {
	commonName: ['CN'],
	surname: ['SN', 'SURNAME'],
	givenName: ['G', 'GN', 'GIVENNAME'],
	organization: ['O'],
	position: ['T', 'TITLE'],
	email: ['E', 'EMAIL', 'EMAILADDRESS', '1.2.840.113549.1.9.1'],
	inn: ['ИНН', 'INN', '1.2.643.3.131.1.1'],
	innLe: ['ИНН ЮЛ', 'ИННЮЛ', 'INNLE', '1.2.643.100.4'],
	ogrn: ['ОГРН', 'OGRN', '1.2.643.100.1'],
	ogrnip: ['ОГРНИП', 'OGRNIP', '1.2.643.100.5'],
	snils: ['СНИЛС', 'SNILS', '1.2.643.100.3'],
} as const

function splitParts(subject: string): string[] {
	const parts: string[] = []
	let current = ''
	let isQuoted = false
	for (const char of subject) {
		if (char === '"') isQuoted = !isQuoted
		if (char === ',' && !isQuoted) {
			parts.push(current)
			current = ''
		} else current += char
	}
	return [...parts, current]
}

function unquote(value: string): string {
	const trimmed = value.trim()
	if (trimmed.length < 2 || !trimmed.startsWith('"') || !trimmed.endsWith('"')) return trimmed
	return trimmed.slice(1, -1).replace(/""/g, '"')
}

function normalizeKey(key: string): string {
	return key
		.trim()
		.replace(/^OID\./i, '')
		.toUpperCase()
}

/** Пары «имя — значение» субъекта: имена — заглавными, без префикса `OID.`; кавычки и удвоенные `""` убраны */
function parseSubjectParts(subject: string): Map<string, string> {
	const result = new Map<string, string>()
	for (const part of splitParts(subject)) {
		const separator = part.indexOf('=')
		if (separator > 0) result.set(normalizeKey(part.slice(0, separator)), unquote(part.slice(separator + 1)))
	}
	return result
}

/** Поля субъекта сертификата по известным именам; отсутствующие — пустые строки */
export function parseSubject(subject: string): Record<keyof typeof FIELDS, string> {
	const parts = parseSubjectParts(subject)
	const entries = Object.entries(FIELDS).map(([field, keys]) => [field, keys.map(key => parts.get(key)).find(Boolean) ?? ''])
	return Object.fromEntries(entries) as Record<keyof typeof FIELDS, string>
}

/** ФИО владельца: фамилия и имя с отчеством, без них — общее имя */
export function ownerName(fields: Record<keyof typeof FIELDS, string>): string {
	const fullName = [fields.surname, fields.givenName].filter(Boolean).join(' ')
	return fullName || fields.commonName
}
