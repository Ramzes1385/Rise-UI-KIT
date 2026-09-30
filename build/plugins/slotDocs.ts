/**
 * Слоты в Docs Storybook: описания из JSDoc интерфейса `defineSlots<BaseXSlots>()` в `types/*.types.ts`.
 * vue-docgen-api берёт имена слотов только из ключей-идентификаторов: слоты в кавычках (`'date-popover'`), `extends`
 * и шаблоны имён (`` [name: `cell-${string}`] ``) остаются без описаний, а динамические `<slot :name>` попадают в
 * таблицу выражением. Плагин идёт после docgen и заменяет `__docgenInfo.slots` списком из интерфейса и шаблона.
 * Тот же разбор использует проверка `npm run test:slot-docs` (scripts/check-slot-docs.mjs).
 */

import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { parse as parseSfc } from '@vue/compiler-sfc'
import type { Plugin } from 'vite'

interface SlotBinding {
	name: string
	title: 'binding'
	description?: string
}

interface SlotDoc {
	name: string
	description: string
	bindings?: SlotBinding[]
}

/** Шаблон имён слотов из индексной сигнатуры: `cell-{key}` и проверка имени */
interface SlotPattern {
	doc: SlotDoc
	test: RegExp
}

export interface ComponentSlots {
	interfaceName: string | null
	found: boolean
	/** Слоты интерфейса и шаблона по порядку: сначала интерфейс, затем слоты только из шаблона */
	slots: SlotDoc[]
	patterns: SlotDoc[]
	/** Статические имена `<slot>` шаблона, которых нет в интерфейсе */
	undeclared: string[]
	/** Выражения динамических `<slot :name>` без шаблона имён в интерфейсе */
	dynamic: string[]
	/** В шаблоне есть динамические `<slot :name>`: объявленный слот может показываться через них */
	hasDynamic: boolean
}

interface TemplateNode {
	type: number
	tag?: string
	props?: { type: number; name: string; value?: { content: string }; arg?: { content: string }; exp?: { content: string } }[]
	children?: TemplateNode[]
	branches?: TemplateNode[]
}

const ELEMENT = 1
const ATTRIBUTE = 6
const DIRECTIVE = 7

const sources = new Map<string, ts.SourceFile>()

function sourceFile(file: string): ts.SourceFile {
	const cached = sources.get(file)
	if (cached) return cached
	const parsed = ts.createSourceFile(file, fs.readFileSync(file, 'utf-8'), ts.ScriptTarget.Latest, true)
	sources.set(file, parsed)
	return parsed
}

function listTypeFiles(dir: string): string[] {
	if (!fs.existsSync(dir)) return []
	return fs.readdirSync(dir).flatMap(name => {
		const file = path.join(dir, name)
		if (fs.statSync(file).isDirectory()) return listTypeFiles(file)
		return name.endsWith('.types.ts') ? [file] : []
	})
}

const typeFilesByRoot = new Map<string, string[]>()

/** Все `*.types.ts` компонентов — для интерфейсов слотов, которые наследуют чужие */
function allTypeFiles(root: string): string[] {
	const cached = typeFilesByRoot.get(root) ?? listTypeFiles(root)
	typeFilesByRoot.set(root, cached)
	return cached
}

type Declaration = ts.InterfaceDeclaration | ts.TypeAliasDeclaration

function findDeclaration(name: string, files: readonly string[]): Declaration | null {
	for (const file of files) {
		const found = sourceFile(file).statements.find(
			(statement): statement is Declaration =>
				(ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) && statement.name.text === name,
		)
		if (found) return found
	}
	return null
}

function jsDocText(node: ts.Node): string {
	const docs = (node as ts.Node & { jsDoc?: ts.JSDoc[] }).jsDoc ?? []
	return docs
		.map(doc => (typeof doc.comment === 'string' ? doc.comment : (ts.getTextOfJSDocComment(doc.comment) ?? '')))
		.join('\n')
		.trim()
}

/** Поля объекта-параметра слота (`(props: { card: KanbanCard }) => unknown`) — привязки для таблицы */
function slotBindings(type: ts.TypeNode | undefined): SlotBinding[] | undefined {
	if (!type || !ts.isFunctionTypeNode(type)) return undefined
	const parameter = type.parameters[0]?.type
	if (!parameter || !ts.isTypeLiteralNode(parameter)) return undefined
	const bindings = parameter.members
		.filter(member => member.name)
		.map(member => ({ name: member.name!.getText(), title: 'binding' as const, description: jsDocText(member) || undefined }))
	return bindings.length ? bindings : undefined
}

const memberName = (name: ts.PropertyName): string => (ts.isStringLiteral(name) ? name.text : name.getText())

/** Индексная сигнатура `` [name: `cell-${string}`] `` → слот `cell-{key}` и проверка имени */
function slotPattern(member: ts.IndexSignatureDeclaration): SlotPattern {
	const text = member.parameters[0]?.type?.getText() ?? 'string'
	const body = text.replace(/^`|`$/g, '')
	const shown = body === 'string' ? '{name}' : body.replace(/\$\{\s*(string|number)\s*\}/g, '{key}')
	const escaped = body.replace(/[.*+?^()|[\]\\]/g, '\\$&').replace(/\$\{\s*(string|number)\s*\}/g, '.+')
	return {
		doc: { name: shown, description: jsDocText(member), bindings: slotBindings(member.type) },
		test: body === 'string' ? /.*/ : new RegExp(`^${escaped}$`),
	}
}

interface Members {
	slots: Map<string, SlotDoc>
	patterns: SlotPattern[]
	found: boolean
}

function membersOf(elements: readonly ts.TypeElement[], result: Members): void {
	for (const member of elements) {
		if (ts.isIndexSignatureDeclaration(member)) result.patterns.push(slotPattern(member))
		else if (member.name && !result.slots.has(memberName(member.name))) {
			const type = ts.isPropertySignature(member) ? member.type : undefined
			result.slots.set(memberName(member.name), {
				name: memberName(member.name),
				description: jsDocText(member),
				bindings: slotBindings(type),
			})
		}
	}
}

/** Члены интерфейса слотов с учётом `extends` и пересечений типов */
function collectMembers(name: string, files: readonly string[], result: Members, seen = new Set<string>()): void {
	if (seen.has(name)) return
	seen.add(name)
	const declaration = findDeclaration(name, files)
	if (!declaration) return
	result.found = true
	if (ts.isInterfaceDeclaration(declaration)) {
		membersOf(declaration.members, result)
		const parents = declaration.heritageClauses?.flatMap(clause => clause.types.map(type => type.expression.getText())) ?? []
		for (const parent of parents) collectMembers(parent, files, result, seen)
		return
	}
	const parts = ts.isIntersectionTypeNode(declaration.type) ? declaration.type.types : [declaration.type]
	for (const part of parts) {
		if (ts.isTypeLiteralNode(part)) membersOf(part.members, result)
		else if (ts.isTypeReferenceNode(part)) collectMembers(part.typeName.getText(), files, result, seen)
	}
}

function templateSlots(root: TemplateNode | undefined): { names: string[]; dynamic: string[] } {
	const names: string[] = []
	const dynamic: string[] = []
	const visit = (node: TemplateNode): void => {
		if (node.type === ELEMENT && node.tag === 'slot') {
			const bound = node.props?.find(prop => prop.type === DIRECTIVE && prop.name === 'bind' && prop.arg?.content === 'name')
			const name = node.props?.find(prop => prop.type === ATTRIBUTE && prop.name === 'name')?.value?.content ?? 'default'
			if (bound) dynamic.push(bound.exp?.content ?? '')
			else if (!names.includes(name)) names.push(name)
		}
		for (const child of [...(node.children ?? []), ...(node.branches ?? [])]) visit(child)
	}
	if (root) visit(root)
	return { names, dynamic }
}

/** Слоты компонента: `file` — `.vue` в `src/components/<X>/ui/`, `source` — его текст */
export function readComponentSlots(file: string, source: string): ComponentSlots {
	const { descriptor } = parseSfc(source, { filename: file })
	const used = templateSlots(descriptor.template?.ast as TemplateNode | undefined)
	const interfaceName = /defineSlots<\s*([\w$]+)\s*>/.exec(descriptor.scriptSetup?.content ?? '')?.[1] ?? null
	const members: Members = { slots: new Map(), patterns: [], found: false }
	if (interfaceName) {
		const own = listTypeFiles(path.join(path.dirname(file), '..', 'types'))
		collectMembers(interfaceName, [...own, ...allTypeFiles(path.join(path.dirname(file), '..', '..'))], members)
	}
	const matchesPattern = (name: string): boolean => members.patterns.some(pattern => pattern.test.test(name))
	const undeclared = used.names.filter(name => !members.slots.has(name) && !matchesPattern(name))
	return {
		interfaceName,
		found: members.found,
		slots: [...members.slots.values(), ...undeclared.map(name => ({ name, description: '' }))],
		patterns: members.patterns.map(pattern => pattern.doc),
		undeclared: interfaceName ? undeclared : used.names,
		dynamic: members.patterns.length ? [] : used.dynamic,
		hasDynamic: used.dynamic.length > 0,
	}
}

const COMPONENT_FILE = /[\\/]src[\\/]components[\\/][^\\/]+[\\/]ui[\\/].+\.vue$/

/** Плагин Storybook: после docgen заменяет `__docgenInfo.slots` компонентов кита слотами из их интерфейсов */
export function createSlotDocsPlugin(): Plugin {
	return {
		name: 'rise:slot-docs',
		transform(code, id) {
			const file = id.split('?')[0]
			if (id.includes('?') || !COMPONENT_FILE.test(file) || !code.includes('__docgenInfo')) return undefined
			const { interfaceName, slots, patterns } = readComponentSlots(file, fs.readFileSync(file, 'utf-8'))
			if (!interfaceName) return undefined
			const list = JSON.stringify([...slots, ...patterns])
			return { code: `${code}\n;if (_sfc_main.__docgenInfo) _sfc_main.__docgenInfo.slots = ${list};`, map: null }
		},
	}
}
