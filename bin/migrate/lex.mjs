/** Разбор текста без внешних парсеров: маски кода (комментарии и строки затёрты пробелами), теги шаблона Vue, блоки .vue. */

const REGEX_KEYWORDS = /(?:^|[^\w$.])(?:return|typeof|case|in|of|delete|void|throw|new|else|do|yield|await)$/

/**
 * Маска JS/TS: той же длины, что исходник; тела комментариев, строк, шаблонных строк и регулярных выражений заменены пробелами
 * (переводы строк сохранены), код внутри `${…}` остаётся. `strings` — диапазоны содержимого строк в кавычках.
 */
export function maskScript(src) {
	const n = src.length
	const code = src.split('')
	const strings = []

	const blank = (from, to) => {
		for (let k = from; k < to; k++) {
			if (code[k] !== '\n' && code[k] !== '\r') code[k] = ' '
		}
	}

	const scanString = (start, quote) => {
		let k = start + 1
		while (k < n && src[k] !== quote && src[k] !== '\n') k += src[k] === '\\' ? 2 : 1
		const end = Math.min(k, n)
		strings.push({ start: start + 1, end, quote })
		blank(start + 1, end)
		return src[end] === quote ? end + 1 : end
	}

	const isRegexStart = at => {
		let p = at - 1
		while (p >= 0 && /\s/.test(code[p])) p--
		if (p < 0) return true
		if (code[p] === ')' || code[p] === ']') return false
		if (/[\w$]/.test(code[p])) return REGEX_KEYWORDS.test(code.slice(Math.max(0, p - 12), p + 1).join(''))
		return true
	}

	const scanRegex = start => {
		let k = start + 1
		let inClass = false
		while (k < n && src[k] !== '\n') {
			const c = src[k]
			if (c === '\\') {
				k += 2
				continue
			}
			if (c === '[') inClass = true
			else if (c === ']') inClass = false
			else if (c === '/' && !inClass) break
			k++
		}
		if (src[k] !== '/') return start + 1
		blank(start + 1, k)
		return k + 1
	}

	const scanTemplate = start => {
		let k = start + 1
		let textStart = k
		while (k < n && src[k] !== '`') {
			if (src[k] === '\\') {
				k += 2
			} else if (src[k] === '$' && src[k + 1] === '{') {
				blank(textStart, k)
				k = scanCode(k + 2, true) + 1
				textStart = k
			} else {
				k++
			}
		}
		const end = Math.min(k, n)
		blank(textStart, end)
		return end < n ? end + 1 : end
	}

	function scanCode(from, inExpression) {
		let k = from
		let depth = 0
		while (k < n) {
			const c = src[k]
			const d = src[k + 1]
			if (c === '/' && d === '/') {
				const e = src.indexOf('\n', k)
				const end = e < 0 ? n : e
				blank(k, end)
				k = end
			} else if (c === '/' && d === '*') {
				const e = src.indexOf('*/', k + 2)
				const end = e < 0 ? n : e + 2
				blank(k, end)
				k = end
			} else if (c === '"' || c === "'") {
				k = scanString(k, c)
			} else if (c === '`') {
				k = scanTemplate(k)
			} else if (c === '/' && isRegexStart(k)) {
				k = scanRegex(k)
			} else if (c === '{') {
				depth++
				k++
			} else if (c === '}') {
				if (inExpression && depth === 0) return k
				depth--
				k++
			} else {
				k++
			}
		}
		return n
	}

	scanCode(0, false)
	return { code: code.join(''), strings }
}

/**
 * Маска CSS/SCSS: затёрты комментарии (блочные, у SCSS ещё строчные) и тела строк. `//` считается комментарием в начале строки или после
 * пробела, `;`, `{`, `}` — адреса вида `http://` и `url(//cdn)` остаются кодом.
 */
export function maskCss(src, isScss) {
	const n = src.length
	const code = src.split('')
	const strings = []
	const blank = (from, to) => {
		for (let k = from; k < to; k++) {
			if (code[k] !== '\n' && code[k] !== '\r') code[k] = ' '
		}
	}
	let k = 0
	while (k < n) {
		const c = src[k]
		if (c === '/' && src[k + 1] === '*') {
			const e = src.indexOf('*/', k + 2)
			const end = e < 0 ? n : e + 2
			blank(k, end)
			k = end
		} else if (isScss && c === '/' && src[k + 1] === '/' && (k === 0 || /[\s;{}]/.test(src[k - 1]))) {
			const e = src.indexOf('\n', k)
			const end = e < 0 ? n : e
			blank(k, end)
			k = end
		} else if (c === '"' || c === "'") {
			let j = k + 1
			while (j < n && src[j] !== c && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1
			const end = Math.min(j, n)
			strings.push({ start: k + 1, end, quote: c })
			blank(k + 1, end)
			k = src[end] === c ? end + 1 : end
		} else {
			k++
		}
	}
	return { code: code.join(''), strings }
}

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const ATTR_RE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/y
const TAG_NAME_RE = /[A-Za-z][^\s/>]*/y

/** `base-animation` → `BaseAnimation`; PascalCase остаётся как есть. */
export function toPascal(name) {
	return name
		.split('-')
		.map(part => part.charAt(0).toUpperCase() + part.slice(1))
		.join('')
}

/** `sizeScale` → `size-scale` */
export function toKebab(name) {
	return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
}

/** Вид атрибута шаблона: проп (`:x`, `x`), событие (`@x`), слот (`#x`) — и имя без модификаторов в kebab-case. */
export function classifyAttr(name) {
	let kind = 'prop'
	let rest = name
	if (name.startsWith('@') || name.startsWith('v-on:')) {
		kind = 'event'
		rest = name.slice(name.startsWith('@') ? 1 : 5)
	} else if (name.startsWith('#') || name.startsWith('v-slot:')) {
		kind = 'slot'
		rest = name.slice(name.startsWith('#') ? 1 : 7)
	} else if (name === 'v-slot') {
		kind = 'slot'
		rest = 'default'
	} else if (name.startsWith(':') || name.startsWith('v-bind:')) {
		rest = name.slice(name.startsWith(':') ? 1 : 7)
	}
	return { kind, key: toKebab(rest.split('.')[0]) }
}

/**
 * Теги шаблона Vue: имя, атрибуты (с позициями), вложенность и признак прямого текста внутри. Строки в кавычках с `>` внутри
 * и комментарии `<!-- -->` обрабатываются. Это не полный HTML-парсер, но для атрибутов и слотов его хватает.
 */
export function parseTemplate(src) {
	const n = src.length
	const elements = []
	const root = { children: [], hasText: false }
	const stack = [root]
	let textFrom = 0
	let i = 0

	const flushText = to => {
		const text = src.slice(textFrom, to).replace(/<!--[\s\S]*?-->/g, '')
		if (/\S/.test(text)) stack[stack.length - 1].hasText = true
	}

	while (i < n) {
		const lt = src.indexOf('<', i)
		if (lt < 0) break
		if (src.startsWith('<!--', lt)) {
			const e = src.indexOf('-->', lt + 4)
			i = e < 0 ? n : e + 3
			continue
		}
		const isClosing = src[lt + 1] === '/'
		TAG_NAME_RE.lastIndex = lt + (isClosing ? 2 : 1)
		const nameMatch = TAG_NAME_RE.exec(src)
		if (!nameMatch) {
			i = lt + 1
			continue
		}
		const name = nameMatch[0]
		let pos = TAG_NAME_RE.lastIndex
		if (isClosing) {
			const gt = src.indexOf('>', pos)
			const closeEnd = gt < 0 ? n : gt + 1
			flushText(lt)
			let at = stack.length - 1
			while (at > 0 && stack[at].name.toLowerCase() !== name.toLowerCase()) at--
			if (at > 0) {
				stack[at].closeStart = lt
				stack.length = at
			}
			textFrom = closeEnd
			i = closeEnd
			continue
		}
		const attrs = []
		let selfClosing = false
		let openEnd = -1
		while (pos < n) {
			while (pos < n && /\s/.test(src[pos])) pos++
			if (src[pos] === '>') {
				openEnd = pos + 1
				break
			}
			if (src[pos] === '/' && src[pos + 1] === '>') {
				selfClosing = true
				openEnd = pos + 2
				break
			}
			ATTR_RE.lastIndex = pos
			const m = ATTR_RE.exec(src)
			if (!m) {
				pos++
				continue
			}
			attrs.push({ name: m[1], start: m.index, end: ATTR_RE.lastIndex, value: m[2] ?? m[3] ?? m[4], ...classifyAttr(m[1]) })
			pos = ATTR_RE.lastIndex
		}
		if (openEnd < 0) break
		flushText(lt)
		const parent = stack[stack.length - 1]
		const element = {
			name,
			tag: toPascal(name),
			start: lt,
			openEnd,
			attrs,
			selfClosing,
			closeStart: -1,
			children: [],
			hasText: false,
			parent,
		}
		parent.children.push(element)
		elements.push(element)
		if (!selfClosing && !VOID_TAGS.has(name.toLowerCase())) stack.push(element)
		textFrom = openEnd
		i = openEnd
	}
	return elements
}

/** Слоты, которые использует элемент: через `<template #x>` внутри и `v-slot` на самом теге. Дочерний `default` — содержимое без `<template #…>`. */
export function slotsOf(element) {
	const slots = []
	let hasDefaultContent = element.hasText
	for (const attr of element.attrs) {
		if (attr.kind === 'slot') slots.push({ name: attr.key, at: attr.start })
	}
	for (const child of element.children) {
		const slotAttr = child.name === 'template' ? child.attrs.find(a => a.kind === 'slot') : undefined
		if (slotAttr) slots.push({ name: slotAttr.key, at: slotAttr.start })
		else hasDefaultContent = true
	}
	const hasDefault = slots.some(s => s.name === 'default') || hasDefaultContent
	return { slots, hasDefault, defaultAt: element.openEnd }
}

const BLOCK_RE = /^<(template|script|style)\b([^>]*)>/gm
const TEMPLATE_END_RE = /^<\/template>/gm

/** Блоки .vue верхнего уровня: `{ type, attrs, start, end }` — `start`/`end` ограничивают содержимое. */
export function splitSfc(src) {
	const blocks = []
	BLOCK_RE.lastIndex = 0
	let m
	while ((m = BLOCK_RE.exec(src))) {
		const type = m[1]
		const start = m.index + m[0].length
		const closeTag = `</${type}>`
		let closeAt = -1
		if (type === 'template') {
			TEMPLATE_END_RE.lastIndex = start
			closeAt = TEMPLATE_END_RE.exec(src)?.index ?? -1
		}
		if (closeAt < 0) closeAt = src.indexOf(closeTag, start)
		if (closeAt < 0) break
		blocks.push({ type, attrs: m[2], start, end: closeAt })
		BLOCK_RE.lastIndex = closeAt + closeTag.length
	}
	return blocks
}

/** Номер строки (с 1) для позиции в тексте. */
export function lineAt(src, index) {
	let line = 1
	for (let k = src.indexOf('\n'); k >= 0 && k < index; k = src.indexOf('\n', k + 1)) line++
	return line
}
