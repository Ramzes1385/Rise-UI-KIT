/**
 * Codemod: унификация стиля доступа к пропсам в шаблонах .vue файлов.
 *
 * В `<template>` заменяет `props.<id>` на `<id>` (в шаблоне пропсы
 * авто-распаковываются Vue), оставляя `<script setup>` нетронутым.
 *
 * Безопасность:
 *  - Negative lookbehind `(?<![\w.$])` не трогает `foo.props.x` и `xprops.x`.
 *  - Зарезервированные слова JS (например `for`) пропускаются: `:for="props.for"`
 *    нельзя упрощать до `:for="for"` (синтаксическая ошибка в выражении).
 *  - Если `<id>` совпадает с локальным binding-ом `<script setup>` — `props.X`
 *    это различение, замена пропускается. Локальные bindings извлекаются
 *    AST-парсером TypeScript (без резолва типов), поэтому generic-extends
 *    вроде `BaseComponentProps<T>` не мешают.
 *
 * Использование:
 *   node scripts/uniform-props-prefix.mjs                 # применить к src/components
 *   node scripts/uniform-props-prefix.mjs --dry-run       # только отчёт
 *   node scripts/uniform-props-prefix.mjs src/components/BaseButton  # другой путь
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { parse } from '@vue/compiler-sfc'
import ts from 'typescript'

const ROOT = process.cwd()
const TARGET_DIR = join(ROOT, process.argv.slice(2).find(a => !a.startsWith('-')) ?? 'src/components')
const DRY_RUN = process.argv.includes('--dry-run')

const PROPS_ACCESS_RE = /(?<![\w.$])props\.([A-Za-z_$][\w$]*)/g

const JS_RESERVED = new Set([
	'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
	'delete', 'do', 'else', 'export', 'extends', 'finally', 'for', 'function', 'if',
	'import', 'in', 'instanceof', 'new', 'return', 'super', 'switch', 'this', 'throw',
	'try', 'typeof', 'var', 'void', 'while', 'with', 'yield', 'let', 'static', 'enum',
	'await', 'implements', 'interface', 'package', 'private', 'protected', 'public',
	'true', 'false', 'null',
])

/** Имена локальных bindings верхнего уровня `<script setup>`. */
function collectSetupBindingNames(content) {
	const sourceFile = ts.createSourceFile('sfc-script.ts', content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
	const names = new Set()

	function addName(nameNode) {
		if (!nameNode) return
		if (ts.isIdentifier(nameNode)) {
			names.add(nameNode.text)
			return
		}
		if (ts.isArrayBindingPattern(nameNode)) {
			for (const el of nameNode.elements) if (ts.isBindingElement(el)) addName(el.name)
			return
		}
		if (ts.isObjectBindingPattern(nameNode)) {
			for (const el of nameNode.elements) if (ts.isBindingElement(el)) addName(el.name)
		}
	}

	function handle(node) {
		if (node.declarationList && ts.isVariableDeclarationList(node.declarationList)) {
			for (const decl of node.declarationList.declarations) addName(decl.name)
			return
		}
		if (
			ts.isFunctionDeclaration(node) ||
			ts.isClassDeclaration(node) ||
			ts.isEnumDeclaration(node) ||
			ts.isInterfaceDeclaration(node) ||
			ts.isTypeAliasDeclaration(node)
		) {
			if (node.name && ts.isIdentifier(node.name)) names.add(node.name.text)
			return
		}
		if (ts.isImportDeclaration(node)) {
			const clause = node.importClause
			if (!clause) return
			if (clause.name) names.add(clause.name.text)
			if (clause.namedBindings) {
				if (ts.isNamespaceImport(clause.namedBindings)) names.add(clause.namedBindings.name.text)
				else if (ts.isNamedImports(clause.namedBindings)) {
					for (const spec of clause.namedBindings.elements) names.add((spec.propertyName ?? spec.name).text)
				}
			}
		}
	}

	for (const stmt of sourceFile.statements) handle(stmt)
	return names
}

function listVueFiles(dir, acc = []) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry)
		if (statSync(full).isDirectory()) listVueFiles(full, acc)
		else if (full.endsWith('.vue')) acc.push(full)
	}
	return acc
}

const files = listVueFiles(TARGET_DIR)
let changedFiles = 0
let totalReplacements = 0
const report = []

for (const file of files) {
	const source = readFileSync(file, 'utf8')
	const { descriptor, errors } = parse(source, { filename: file })
	if (errors && errors.length) {
		report.push(`SKIP (parse error): ${relative(ROOT, file)}`)
		continue
	}
	const tpl = descriptor.template
	if (!tpl || !tpl.content) continue

	const start = tpl.loc.start.offset
	const end = start + tpl.content.length
	const inner = tpl.content

	const setupBlock = descriptor.scriptSetup ?? descriptor.script
	const setupNames = setupBlock ? collectSetupBindingNames(setupBlock.content) : new Set()

	let replaced = 0
	const skipped = []
	const newInner = inner.replace(PROPS_ACCESS_RE, (full, name) => {
		if (JS_RESERVED.has(name)) {
			skipped.push(`${name}(reserved)`)
			return full
		}
		if (setupNames.has(name)) {
			skipped.push(`${name}(collision)`)
			return full
		}
		replaced++
		return name
	})

	if (replaced === 0) continue

	totalReplacements += replaced
	changedFiles++
	const skipNote = skipped.length ? ` (skipped: ${[...new Set(skipped)].join(',')})` : ''
	report.push(`${String(replaced).padStart(3)}  ${relative(ROOT, file).replace(/\\/g, '/')}${skipNote}`)

	const newSource = source.slice(0, start) + newInner + source.slice(end)
	if (!DRY_RUN) writeFileSync(file, newSource, 'utf8')
}

console.log(`Mode: ${DRY_RUN ? 'DRY-RUN' : 'WRITE'}`)
console.log(`Files changed: ${changedFiles}`)
console.log(`Total replacements: ${totalReplacements}\n`)
report.forEach(line => console.log(line))
