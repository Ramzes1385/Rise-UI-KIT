/** Утилиты: подсветка кода без зависимостей — фрагменты по языку, строки для номеров, названия языков */
import { runRules } from './codeTokenizer'
import { tokenizeMarkup } from './grammars/markupGrammar'
import { CSS_RULES, SCSS_RULES } from './grammars/styleGrammar'
import { JSON_RULES, scriptRules } from './grammars/scriptGrammar'
import { BASH_RULES, PYTHON_RULES } from './grammars/shellGrammar'
import type { CodeLanguage, CodeRule, CodeToken } from './types/codeHighlightUtils.types'

/** Названия языков для заголовка блока кода */
const CODE_LANGUAGE_NAMES: Readonly<Record<CodeLanguage, string>> = {
	javascript: 'JavaScript',
	typescript: 'TypeScript',
	json: 'JSON',
	html: 'HTML',
	vue: 'Vue',
	css: 'CSS',
	scss: 'SCSS',
	bash: 'Bash',
	python: 'Python',
}

const LANGUAGE_ALIASES: Readonly<Record<string, CodeLanguage>> = {
	js: 'javascript',
	jsx: 'javascript',
	mjs: 'javascript',
	cjs: 'javascript',
	javascript: 'javascript',
	ts: 'typescript',
	tsx: 'typescript',
	mts: 'typescript',
	cts: 'typescript',
	typescript: 'typescript',
	json: 'json',
	jsonc: 'json',
	json5: 'json',
	html: 'html',
	htm: 'html',
	xhtml: 'html',
	xml: 'html',
	svg: 'html',
	vue: 'vue',
	css: 'css',
	scss: 'scss',
	bash: 'bash',
	sh: 'bash',
	shell: 'bash',
	shellscript: 'bash',
	zsh: 'bash',
	console: 'bash',
	python: 'python',
	py: 'python',
	py3: 'python',
}

const RULES: Readonly<Record<Exclude<CodeLanguage, 'html' | 'vue'>, CodeRule[]>> = {
	javascript: scriptRules(false),
	typescript: scriptRules(true),
	json: JSON_RULES,
	css: CSS_RULES,
	scss: SCSS_RULES,
	bash: BASH_RULES,
	python: PYTHON_RULES,
}

/**
 * Язык подсветки по имени или псевдониму из блока кода Markdown (`js`, `ts`, `sh`, `py`, `vue`…) без учёта регистра;
 * null — язык не поддерживается, код показывается простым текстом
 */
function normalizeCodeLanguage(language: string | null | undefined): CodeLanguage | null {
	const key = (language ?? '').trim().toLowerCase()
	return Object.hasOwn(LANGUAGE_ALIASES, key) ? LANGUAGE_ALIASES[key]! : null
}

/** Название языка для заголовка: «TypeScript» для `ts`; неизвестный язык — как передан, пустой — '' */
function getCodeLanguageName(language: string | null | undefined): string {
	const normalized = normalizeCodeLanguage(language)
	return normalized ? CODE_LANGUAGE_NAMES[normalized] : (language ?? '').trim()
}

function tokenizeKnown(code: string, language: CodeLanguage): CodeToken[] {
	if (language === 'html' || language === 'vue') return tokenizeMarkup(code, language === 'vue', tokenizeKnown)
	return runRules(code, RULES[language])
}

/**
 * Фрагменты кода по языку: склеенный текст фрагментов равен `code`. Неизвестный язык — один фрагмент простого текста.
 * Вывод — только текстом (`{{ token.value }}`), не через `v-html`: разметка в коде не исполняется
 *
 * @example
 * ```ts
 * tokenizeCode('const a = 1', 'ts')
 * // [{ type: 'keyword', value: 'const' }, { type: null, value: ' a = ' }, { type: 'number', value: '1' }]
 * ```
 */
function tokenizeCode(code: string, language: string | null | undefined): CodeToken[] {
	const normalized = normalizeCodeLanguage(language)
	if (!code) return []
	return normalized ? tokenizeKnown(code, normalized) : [{ type: null, value: code }]
}

/** Делит фрагменты на строки по `\n` (сам перевод строки не входит): фрагмент, который переходит строку, режется */
function splitCodeLines(tokens: readonly CodeToken[]): CodeToken[][] {
	const lines: CodeToken[][] = [[]]
	for (const token of tokens) {
		const parts = token.value.split('\n')
		parts.forEach((part, index) => {
			if (index > 0) lines.push([])
			if (part) lines[lines.length - 1]!.push({ type: token.type, value: part })
		})
	}
	return lines
}

/** Подсветка по строкам: `splitCodeLines(tokenizeCode(code, language))`; пустой код — одна пустая строка */
function highlightCode(code: string, language: string | null | undefined): CodeToken[][] {
	return splitCodeLines(tokenizeCode(code, language))
}

export { CODE_LANGUAGE_NAMES, getCodeLanguageName, highlightCode, normalizeCodeLanguage, splitCodeLines, tokenizeCode }
