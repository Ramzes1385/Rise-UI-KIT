/**
 * Тексты интерфейса — только из словаря (`src/locales`). Проверка ищет в исходниках кита строки и текст шаблонов
 * мимо словаря: кириллицу в строковых литералах и шаблонах, а в шаблонах `.vue` — ещё и латиницу в тексте и в
 * атрибутах, которые читают люди (`aria-label`, `title`, `placeholder`, `alt`…). Комментарии и регулярные
 * выражения не проверяются. Исключения — в `ALLOWED` с причиной.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'
import { parse as parseSfc } from '@vue/compiler-sfc'

const ROOT = join(import.meta.dirname, '..')
const SOURCES = ['src/components', 'src/composables', 'src/utils', 'src/plugin', 'src/icons', 'src/locales']
/** Словари `ru` и `en` — и есть место для текстов; их проверяет тест src/locales */
const SKIPPED_DIRS = new Set(['__tests__', 'stories', 'node_modules', 'ru', 'en'])
const CYRILLIC = /[Ѐ-ӿ]/
const LATIN_WORD = /[A-Za-z]{2,}/
const HUMAN_ATTRIBUTES = new Set([
	'aria-label',
	'aria-description',
	'aria-roledescription',
	'aria-valuetext',
	'title',
	'placeholder',
	'alt',
])

/** Исключения: файл и причина, а если исключение не на весь файл — сам текст */
const ALLOWED = [
	{
		file: 'src/components/BaseEmojiPicker/model/data/emojiRu.ts',
		reason: 'русские названия эмодзи — данные поиска, английские — в emojiEn.ts',
	},
	{ file: 'src/utils/data/textUtils/textUtils.ts', text: 'е', reason: 'поиск без различия «е» и «ё»' },
	{
		file: 'src/components/BaseChat/model/slideover/useChatSlideover.ts',
		text: 'сети',
		reason: 'статус собеседника из данных приложения: «в сети» распознаётся на обоих языках',
	},
	{
		file: 'src/components/BaseChat/model/slideover/useChatSlideover.ts',
		text: 'онлайн',
		reason: 'статус собеседника из данных приложения: «онлайн» распознаётся на обоих языках',
	},
	{
		file: 'src/composables/crypto/useCryptoPro/core/operations/subject.ts',
		reason: 'имена полей субъекта сертификата (ИНН, ОГРН, СНИЛС) — так их отдаёт КриптоПро, это ключи разбора, а не текст',
	},
	{
		file: 'src/composables/crypto/useCryptoPro/emulation/emulatedCertificates.ts',
		reason: 'данные эмуляции КриптоПро: субъекты тестовых сертификатов, как их отдаёт плагин',
	},
	{
		file: 'src/composables/crypto/useCryptoPro/emulation/emulatedObjects.ts',
		reason: 'тексты ошибок эмуляции КриптоПро — как их отдаёт getLastError плагина на русской системе',
	},
	{
		file: 'src/components/BaseCryptoProSign/model/emulation/emulatedSignature.ts',
		reason: 'тексты ошибок эмуляции подписи и проверки КриптоПро — как их отдаёт getLastError плагина на русской системе',
	},
]

function listFiles(dir) {
	return readdirSync(dir).flatMap(name => {
		const path = join(dir, name)
		if (statSync(path).isDirectory()) return SKIPPED_DIRS.has(name) ? [] : listFiles(path)
		return /\.(ts|vue)$/.test(name) && !name.endsWith('.d.ts') ? [path] : []
	})
}

const isAllowed = (file, text) => ALLOWED.some(rule => rule.file === file && (rule.text === undefined || rule.text === text))

/** Строковые литералы и куски шаблонных строк в коде TypeScript; `offset` — сдвиг строки для `.vue` */
function scriptStrings(code, offsetLine = 0) {
	const source = ts.createSourceFile('file.ts', code, ts.ScriptTarget.Latest, true)
	const found = []
	const visit = node => {
		if (
			ts.isStringLiteral(node) ||
			ts.isNoSubstitutionTemplateLiteral(node) ||
			ts.isTemplateHead(node) ||
			ts.isTemplateMiddle(node) ||
			ts.isTemplateTail(node)
		) {
			const { line } = source.getLineAndCharacterOfPosition(node.getStart())
			found.push({ text: node.text, line: line + 1 + offsetLine })
		}
		ts.forEachChild(node, visit)
	}
	visit(source)
	return found
}

/** Текст и атрибуты шаблона: статический текст, статические атрибуты и строки в выражениях привязок */
function templateStrings(ast, startLine) {
	const found = []
	const expression = (content, line) => scriptStrings(`(${content})`, line - 1).map(item => ({ ...item, isCode: true }))
	const visit = node => {
		const line = startLine + (node.loc?.start.line ?? 1) - 1
		if (node.type === 2) found.push({ text: node.content, line, isText: true })
		if (node.type === 5) found.push(...expression(node.content.content, line))
		for (const prop of node.props ?? []) {
			const propLine = startLine + prop.loc.start.line - 1
			if (prop.type === 6 && prop.value) found.push({ text: prop.value.content, line: propLine, attribute: prop.name })
			if (prop.type === 7 && prop.exp?.content) found.push(...expression(prop.exp.content, propLine))
		}
		for (const child of node.children ?? []) visit(child)
		for (const branch of node.branches ?? []) visit(branch)
	}
	visit(ast)
	return found
}

function vueStrings(code) {
	const { descriptor } = parseSfc(code)
	const found = []
	if (descriptor.template?.ast) found.push(...templateStrings(descriptor.template.ast, 1))
	for (const block of [descriptor.script, descriptor.scriptSetup].filter(Boolean)) {
		found.push(...scriptStrings(block.content, block.loc.start.line - 1))
	}
	return found
}

function problemsOf(item) {
	const text = item.text.trim()
	if (!text) return null
	if (CYRILLIC.test(text)) return 'кириллица мимо словаря'
	if (item.isText && LATIN_WORD.test(text)) return 'текст шаблона мимо словаря'
	if (item.attribute && HUMAN_ATTRIBUTES.has(item.attribute) && LATIN_WORD.test(text)) return `атрибут ${item.attribute} мимо словаря`
	return null
}

const problems = []
for (const dir of SOURCES) {
	for (const path of listFiles(join(ROOT, dir))) {
		const file = relative(ROOT, path).replaceAll('\\', '/')
		const code = readFileSync(path, 'utf-8')
		const items = path.endsWith('.vue') ? vueStrings(code) : scriptStrings(code)
		for (const item of items) {
			const problem = problemsOf(item)
			if (problem && !isAllowed(file, item.text.trim()))
				problems.push(`${file}:${item.line} — ${problem}: «${item.text.trim().slice(0, 80)}»`)
		}
	}
}

if (problems.length) {
	console.error(`❌ Тексты интерфейса мимо словаря (${problems.length}). Вынесите их в src/locales (ru и en):\n`)
	for (const problem of problems) console.error(`  ${problem}`)
	process.exit(1)
}
console.log('✅ Тексты интерфейса — только из словаря.')
