/** Преобразования одного файла: механические правки (edits) и предупреждения. Работает по маске кода, поэтому строки и комментарии не задеваются. */

import { lineAt, maskCss, maskScript, parseTemplate, slotsOf, splitSfc } from './lex.mjs'
import {
	ALIAS_TOKENS,
	ARIA_GROUP_TAGS,
	BOLD_TEXT_TAGS,
	CHANGED_EXPORTS,
	CLASS_RENAMES,
	CSS_SELECTORS,
	CSS_TOKENS,
	DEAD_PROPS,
	DEFAULT_SLOT_REMOVED,
	KIT,
	OBJECT_ARGS,
	REMOVED_EXPORTS,
	REMOVED_LOCALE_KEYS,
	SECTION,
	SELF_NAVIGATING,
	TAG_WARNINGS,
	TOOLTIP_CLASS,
} from './rules.mjs'

const SCRIPT_EXT = /\.(?:[cm]?[jt]s|[jt]sx)$/
const PLAYER_TAGS = ['BaseMediaPlayer', 'BasePresentationPlayer']
const IMPORT_RE = /\bimport(\s+type(?=\s))?\s*((?:[\w$]+)?\s*,?\s*(?:\*\s*as\s+[\w$]+|\{[^}]*\})?)\s*from\s*(['"])/dg
const EXPORT_RE = /\bexport(\s+type(?=\s))?\s*(\{[^}]*\}|\*(?:\s*as\s+[\w$]+)?)\s*from\s*(['"])/dg
const BARE_RE = /\bimport\s*(['"])/g
const DYNAMIC_RE = /\b(?:import|require)\s*\(\s*(['"])/g
const SEMI_RE = /[ \t]*;/y
const ROUTER_RE = /\$?router\b|\bpush\s*\(/
const STYLE_IMPORT_RE = /@(?:import|use|forward)\s+(?:url\(\s*)?(['"])/g

const isKitSpec = spec => spec === KIT || spec.startsWith(`${KIT}/`)
const isStylesSpec = spec => /^@ramzes1385\/rise-ui-kit\/styles(?:\.layer)?(?:\.css)?$/.test(spec)
const isMediaCssSpec = spec => spec === `${KIT}/media.css` || spec === `${KIT}/media.layer.css`
const escapeRe = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const mediaSpecFor = stylesSpec =>
	stylesSpec.replace(/styles(\.layer\.css|\.css)?$/, (_, tail) => (tail === '.layer.css' ? 'media.layer.css' : 'media.css'))

/** Применяет непересекающиеся правки к тексту. */
export function applyEdits(text, edits) {
	let result = text
	for (const edit of [...edits].sort((a, b) => b.start - a.start))
		result = result.slice(0, edit.start) + edit.text + result.slice(edit.end)
	return result
}

function parseClause(code, start, end) {
	const text = code.slice(start, end)
	const open = text.indexOf('{')
	const named = []
	let inner = ''
	if (open >= 0) {
		const bracesStart = start + open
		inner = code.slice(bracesStart + 1, start + text.indexOf('}', open))
		for (const m of inner.matchAll(/[^,]+/g)) {
			const trimmed = m[0].trim()
			if (!trimmed) continue
			const parts = /^(type\s+)?(\S+?)(?:\s+as\s+(\S+))?$/.exec(trimmed)
			named.push({
				isType: Boolean(parts[1]),
				imported: parts[2],
				local: parts[3] ?? parts[2],
				text: trimmed,
				at: bracesStart + 1 + m.index + m[0].indexOf(trimmed),
			})
		}
	}
	const head = open >= 0 ? text.slice(0, open) : text
	const def = /^\s*([\w$]+)\s*,?\s*$/.exec(head)?.[1]
	const ns = /\*\s*as\s+([\w$]+)/.exec(text)?.[1]
	const layout = {
		multiline: inner.includes('\n'),
		indent: /\n([ \t]*)\S/.exec(inner)?.[1] ?? '\t',
		closeIndent: /\n([ \t]*)$/.exec(inner)?.[1] ?? '',
		trailingComma: /,\s*$/.test(inner),
		pad: /^\s/.test(inner) ? ' ' : '',
	}
	return { def, ns, named, layout }
}

/** Разбор модуля: ссылки на модули (import/export/динамические), локальные имена из кита и чужих модулей. */
export function analyzeScript(src) {
	const { code, strings } = maskScript(src)
	const strAt = new Map(strings.map(s => [s.start, s]))
	const refs = []
	const withSemi = end => {
		SEMI_RE.lastIndex = end
		const m = SEMI_RE.exec(src)
		return m ? { end: end + m[0].length, hasSemi: true } : { end, hasSemi: false }
	}
	const add = (kind, match, quoteAt, extra = {}) => {
		const str = strAt.get(quoteAt + 1)
		const tail = kind === 'dynamic' ? { end: str.end + 1, hasSemi: false } : withSemi(str.end + 1)
		refs.push({
			kind,
			start: match.index,
			spec: src.slice(str.start, str.end),
			specStart: str.start,
			specEnd: str.end,
			quote: str.quote,
			...tail,
			...extra,
		})
	}
	for (const m of code.matchAll(IMPORT_RE)) {
		add('import', m, m.index + m[0].length - 1, { isType: Boolean(m[1]), clause: parseClause(code, m.indices[2][0], m.indices[2][1]) })
	}
	for (const m of code.matchAll(EXPORT_RE)) add('export', m, m.index + m[0].length - 1)
	for (const m of code.matchAll(BARE_RE)) add('bare', m, m.index + m[0].length - 1)
	for (const m of code.matchAll(DYNAMIC_RE)) add('dynamic', m, m.index + m[0].length - 1)
	refs.sort((a, b) => a.start - b.start)

	const kitLocals = new Map()
	const kitNs = new Map()
	const foreign = new Set()
	const imported = new Set()
	for (const ref of refs) {
		if (ref.kind !== 'import') continue
		const { def, ns, named } = ref.clause
		const names = [...(def ? [def] : []), ...(ns ? [ns] : []), ...named.map(n => n.local)]
		for (const name of names) imported.add(name)
		if (!isKitSpec(ref.spec)) {
			for (const name of names) foreign.add(name)
			continue
		}
		if (ns) kitNs.set(ns, ref.spec)
		for (const item of named) kitLocals.set(item.local, { imported: item.imported, spec: ref.spec })
	}
	return { src, code, strAt, strings, refs, kitLocals, kitNs, foreign, imported, eol: src.includes('\r\n') ? '\r\n' : '\n' }
}

function formatImport(model, ref) {
	const parts = []
	if (model.def) parts.push(model.def)
	if (model.named.length) {
		const { layout } = model
		const eol = model.eol
		const body = layout.multiline
			? `${eol}${layout.indent}${model.named.join(`,${eol}${layout.indent}`)}${layout.trailingComma ? ',' : ''}${eol}${layout.closeIndent}`
			: `${layout.pad}${model.named.join(', ')}${layout.pad}`
		parts.push(`{${body}}`)
	}
	if (!parts.length) return ''
	return `import${model.isType ? ' type' : ''} ${parts.join(', ')} from ${ref.quote}${ref.spec}${ref.quote}${ref.hasSemi ? ';' : ''}`
}

/** Разбор аргументов вызова по маске кода: [{ start, end }] верхнего уровня и позиция закрывающей скобки. */
function splitArgs(code, open) {
	const args = []
	let depth = 0
	let from = open + 1
	for (let k = from; k < code.length; k++) {
		const c = code[k]
		if (c === '(' || c === '[' || c === '{') {
			depth++
		} else if (c === ')' || c === ']' || c === '}') {
			if (depth === 0) {
				args.push({ start: from, end: k })
				return { close: k, args }
			}
			depth--
		} else if (c === ',' && depth === 0) {
			args.push({ start: from, end: k })
			from = k + 1
		}
	}
	return null
}

/** Имена, под которыми функция кита вызывается в файле: прямой импорт (в том числе с `as`) и обращение через namespace. */
function calleesFor(an, fnNames) {
	const callees = new Map()
	for (const [local, info] of an.kitLocals) {
		if (fnNames.includes(info.imported)) callees.set(local, info.imported)
		if (info.imported === 'utils' && info.spec === KIT) for (const fn of fnNames) callees.set(`${local}.${fn}`, fn)
	}
	for (const [ns, spec] of an.kitNs) {
		for (const fn of fnNames) callees.set(spec === `${KIT}/utils` ? `${ns}.${fn}` : `${ns}.utils.${fn}`, fn)
	}
	return callees
}

function findCalls(an, callees) {
	if (!callees.size) return []
	const re = new RegExp(`(?<![\\w$.])(${[...callees.keys()].map(escapeRe).join('|')})\\s*\\(`, 'g')
	const calls = []
	for (const m of an.code.matchAll(re)) {
		const open = m.index + m[0].length - 1
		const split = splitArgs(an.code, open)
		if (!split) continue
		const args = split.args.map(a => an.src.slice(a.start, a.end).trim())
		if (args[args.length - 1] === '') args.pop()
		calls.push({ start: m.index, fn: callees.get(m[1]), open, close: split.close, args })
	}
	return calls
}

/** Позиции имени как отдельного слова; `isMember` — учитывать и обращения через точку (`file.name`). */
function wordRefs(code, name, isMember = false) {
	return [...code.matchAll(new RegExp(`(?<![\\w$${isMember ? '' : '.'}])${escapeRe(name)}(?![\\w$])`, 'g'))].map(m => m.index)
}

/** Правки и предупреждения скрипта (`.ts`, `.js`, `<script>` в `.vue`). Позиции — внутри переданного текста. */
export function scriptRules(an, selfIsMediaTarget) {
	const { src, code, refs } = an
	const edits = []
	const warnings = []
	const warn = (at, id, text, section) => warnings.push({ at, id, text, section })

	// 1. подпуть /plugins → /icons
	for (const ref of refs) {
		if (ref.spec === `${KIT}/plugins`) edits.push({ start: ref.specStart, end: ref.specEnd, text: `${KIT}/icons` })
	}

	// 2. вызовы: объект вместо списка, getTooltipTransition
	const callFns = [...Object.keys(OBJECT_ARGS), 'getTooltipTransition']
	let lastEnd = -1
	const replacedStarts = new Set()
	for (const call of findCalls(an, calleesFor(an, callFns))) {
		if (call.start < lastEnd) continue
		if (call.args.some(a => a.startsWith('...'))) {
			warn(call.start, 'call-spread', `${call.fn}: аргументы с spread, переход на новую сигнатуру сделайте вручную`, SECTION.utils)
			continue
		}
		if (call.fn === 'getTooltipTransition') {
			if (call.args.length !== 1) continue
			const literal = /^(['"])([\w-]+)\1$/.exec(call.args[0])
			const text = literal ? `${literal[1]}tooltip-${literal[2]}${literal[1]}` : `\`tooltip-\${${call.args[0]}}\``
			edits.push({ start: call.start, end: call.close + 1, text })
			replacedStarts.add(call.start)
		} else {
			const rule = OBJECT_ARGS[call.fn]
			if (!rule.counts.includes(call.args.length)) continue
			edits.push({ start: call.open + 1, end: call.close, text: rule.build(call.args) })
		}
		lastEnd = call.close + 1
	}

	// 3. импорты кита: plugins → icons, BaseMediaPlayer → /media, getTooltipTransition убирается
	const models = new Map()
	const moved = []
	let movedFrom = null
	const modelOf = ref => {
		if (!models.has(ref)) models.set(ref, { ...ref.clause, isType: ref.isType, named: ref.clause.named.map(n => n.text), eol: an.eol })
		return models.get(ref)
	}
	for (const ref of refs) {
		if (ref.kind !== 'import' || !isKitSpec(ref.spec)) continue
		for (const item of ref.clause.named) {
			if (ref.spec === KIT && item.imported === 'plugins') {
				const model = modelOf(ref)
				const at = model.named.indexOf(item.text)
				model.named[at] = item.text.replace(/^plugins(?=\s|$)/, item.local === 'plugins' ? 'icons as plugins' : 'icons')
			} else if ((ref.spec === KIT || ref.spec === `${KIT}/components`) && item.imported === 'BaseMediaPlayer') {
				const model = modelOf(ref)
				model.named.splice(model.named.indexOf(item.text), 1)
				moved.push(item.text)
				movedFrom ??= ref
			} else if (item.imported === 'getTooltipTransition' && (ref.spec === KIT || ref.spec === `${KIT}/utils`)) {
				const left = wordRefs(code, item.local).filter(at => !replacedStarts.has(at) && (at < ref.start || at >= ref.end))
				if (left.length) {
					warn(
						left[0],
						'tooltip-transition',
						'getTooltipTransition удалена: замените на шаблонную строку `tooltip-${position}`',
						SECTION.utils,
					)
				} else {
					const model = modelOf(ref)
					model.named.splice(model.named.indexOf(item.text), 1)
				}
			} else if (REMOVED_EXPORTS[item.imported]) {
				warn(item.at, 'removed-export', ...REMOVED_EXPORTS[item.imported])
			} else if (CHANGED_EXPORTS[item.imported]) {
				warn(item.at, 'changed-export', ...CHANGED_EXPORTS[item.imported])
			}
		}
	}
	let mediaTarget = null
	if (moved.length) {
		mediaTarget = refs.find(r => r.kind === 'import' && r.spec === `${KIT}/media` && !r.isType && !r.clause.ns && r.clause.named.length)
		if (mediaTarget) modelOf(mediaTarget).named.push(...moved)
	}
	for (const [ref, model] of models) {
		let text = formatImport(model, ref)
		if (ref === movedFrom && !mediaTarget) {
			const added = formatImport(
				{ named: moved, layout: { multiline: false, pad: ' ' }, isType: false, eol: an.eol },
				{ quote: ref.quote, spec: `${KIT}/media`, hasSemi: ref.hasSemi },
			)
			text = text ? `${text}${an.eol}${added}` : added
		}
		const lineBreak = text ? null : /^\r?\n/.exec(src.slice(ref.end))
		edits.push({ start: ref.start, end: ref.end + (lineBreak ? lineBreak[0].length : 0), text })
	}

	// 4. namespace root: kit.plugins → kit.icons
	for (const [ns, spec] of an.kitNs) {
		if (spec !== KIT) continue
		for (const m of code.matchAll(new RegExp(`(?<![\\w$.])${escapeRe(ns)}\\.plugins(?![\\w$])`, 'g'))) {
			edits.push({ start: m.index + ns.length + 1, end: m.index + m[0].length, text: 'icons' })
		}
	}

	// 5. createTheme({ motion: 'default' }) → 'standard'
	const themeNames = ['createTheme', 'ThemeMotion', 'THEME_MOTIONS']
	const usesTheme = an.kitNs.size > 0 || [...an.kitLocals.values()].some(info => themeNames.includes(info.imported))
	// 6. значки вкладок строкой HTML, статус 'pending', ключи словаря
	const hasUpload = /FileUpload|UploadedFile|file-upload/.test(src)
	const hasLocale = /\bdefineLocale\b/.test(code)
	for (const str of an.strings) {
		const value = src.slice(str.start, str.end)
		const before = code.slice(Math.max(0, str.start - 40), str.start - 1)
		if (usesTheme && value === 'default' && /\bmotion\s*:\s*$/.test(before))
			edits.push({ start: str.start, end: str.end, text: 'standard' })
		if (value.startsWith('<') && /\bicon\s*:\s*$/.test(before)) {
			warn(
				str.start,
				'tabs-icon-html',
				'значок вкладки (icon) строкой HTML не вставляется: укажите имя иконки BaseIcon или слот icon',
				SECTION.tabs,
			)
		}
		if (hasUpload && value === 'pending' && /\bstatus\s*(?:[:=!]=*)\s*$/.test(before)) {
			warn(
				str.start,
				'upload-pending',
				"статус файла 'pending' удалён: используйте 'selected' (и передайте uploader для загрузки)",
				SECTION.upload,
			)
		}
		if (hasLocale && REMOVED_LOCALE_KEYS[value])
			warn(str.start, 'locale-key', `ключ словаря ${value} удалён из ru/en: уберите его из defineLocale`, REMOVED_LOCALE_KEYS[value])
	}
	if (hasLocale) {
		for (const [key, section] of Object.entries(REMOVED_LOCALE_KEYS)) {
			for (const at of wordRefs(code, key)) {
				if (/^\s*:/.test(code.slice(at + key.length, at + key.length + 20))) {
					warn(at, 'locale-key', `ключ словаря ${key} удалён из ru/en: уберите его из defineLocale`, section)
				}
			}
		}
	}
	if (hasUpload) {
		for (const at of wordRefs(code, 'previewUrl', true)) {
			warn(
				at,
				'upload-preview',
				'previewUrl в событии remove теперь blob:-адрес и освобождается сразу после события: копируйте файл (file.file)',
				SECTION.upload,
			)
		}
	}

	// 7. медиа-стили плеера после импорта styles
	const stylesImport = refs.find(r => r.kind === 'bare' && isStylesSpec(r.spec))
	if (selfIsMediaTarget && stylesImport) {
		const text = `${an.eol}import ${stylesImport.quote}${mediaSpecFor(stylesImport.spec)}${stylesImport.quote}${stylesImport.hasSemi ? ';' : ''}`
		edits.push({ start: stylesImport.end, end: stylesImport.end, text })
	}
	return { edits, warnings }
}

function wsBefore(src, at) {
	let k = at
	while (k > 0 && /\s/.test(src[k - 1])) k--
	return k
}

/** Правки и предупреждения шаблона Vue. */
export function templateRules(src, foreign, imported) {
	const edits = []
	const warnings = []
	const warn = (at, id, text, section) => warnings.push({ at, id, text, section })
	for (const el of parseTemplate(src)) {
		const tag = el.tag
		if (foreign.has(tag)) continue
		for (const attr of el.attrs) {
			if (attr.kind === 'prop' && DEAD_PROPS[tag]?.includes(attr.key))
				edits.push({ start: wsBefore(src, attr.start), end: attr.end, text: '' })
		}
		const slots = slotsOf(el)
		for (const rule of TAG_WARNINGS) {
			if (!rule.tags.includes(tag)) continue
			const hits =
				rule.kind === 'slot'
					? slots.slots.filter(s => rule.keys.includes(s.name))
					: el.attrs.filter(a => a.kind === rule.kind && rule.keys.includes(a.key)).map(a => ({ at: a.start }))
			for (const hit of hits) warn(hit.at, rule.id, rule.text, rule.section)
		}
		if (DEFAULT_SLOT_REMOVED[tag] && slots.hasDefault) {
			const explicit = slots.slots.find(s => s.name === 'default')
			warn(
				explicit ? explicit.at : slots.defaultAt,
				'default-slot',
				`${tag}: слот default удалён (${DEFAULT_SLOT_REMOVED[tag]}); содержимое и раньше не показывалось`,
				SECTION.slots,
			)
		}
		if (SELF_NAVIGATING.includes(tag)) {
			for (const attr of el.attrs) {
				if (attr.kind === 'event' && attr.value && ROUTER_RE.test(attr.value)) {
					warn(
						attr.start,
						'router-push',
						`${tag}: элементы с to/href открываются сами, router.push в обработчике ${attr.name} дублирует переход`,
						SECTION.order,
					)
				}
			}
		}
		if (ARIA_GROUP_TAGS.includes(tag)) {
			const role = el.attrs.find(a => a.name === 'role' && a.value === 'group')
			if (role && el.attrs.some(a => a.key === 'aria-label')) {
				warn(
					role.start,
					'aria-group',
					`${tag}: aria-label вместе с role="group" — уберите role, имя теперь у самого контрола`,
					SECTION.formsNames,
				)
			}
		}
		if (tag === 'BaseText') {
			const staticTag = el.attrs.find(a => a.name === 'tag')
			if (staticTag && BOLD_TEXT_TAGS.test(staticTag.value ?? '') && !el.attrs.some(a => a.key === 'weight')) {
				warn(
					staticTag.start,
					'text-weight',
					`BaseText tag="${staticTag.value}" без weight стал жирным: вес берётся из тега`,
					SECTION.text,
				)
			}
		}
		if (PLAYER_TAGS.includes(tag) && !imported.has(tag)) {
			warn(el.start, 'player-global', `${tag} не регистрируется плагином: импортируйте его из ${KIT}/media`, SECTION.order)
		}
	}
	return { edits, warnings }
}

/** Правки и предупреждения CSS/SCSS. */
export function cssRules(src, isScss, ctx, selfIsMediaTarget) {
	const { code } = maskCss(src, isScss)
	const edits = []
	const warnings = []
	const warn = (at, id, text, section) => warnings.push({ at, id, text, section })

	for (const rule of CLASS_RENAMES) {
		if (rule.needsAnimation && !ctx.usesAnimation) continue
		const re = new RegExp(`\\.${escapeRe(rule.from)}-(${rule.states.join('|')})(?![\\w-])`, 'g')
		for (const m of code.matchAll(re)) {
			if (ctx.ownTransitionDynamic || ctx.ownTransitions.has(rule.from)) {
				warn(
					m.index,
					'class-conflict',
					`${m[0]}: в проекте есть свой Transition с таким именем, класс не переименован; если это переход кита, замените на .${rule.to}-${m[1]}`,
					rule.section,
				)
			} else {
				edits.push({ start: m.index, end: m.index + m[0].length, text: `.${rule.to}-${m[1]}` })
			}
		}
	}
	for (const m of code.matchAll(TOOLTIP_CLASS)) {
		if (ctx.ownTransitions.has(`tooltip-${m[1]}`)) continue
		warn(
			m.index,
			'tooltip-class',
			`${m[0]}: кит объединил стороны в один переход base-tooltip-*: стили сторон перенесите на .base-tooltip-${m[2]}`,
			SECTION.tooltip,
		)
	}
	for (const [re, text, section] of CSS_SELECTORS) {
		for (const m of code.matchAll(re)) warn(m.index, 'css-selector', `${m[0].trim()}: ${text}`, section)
	}
	for (const m of code.matchAll(/\.base-editor\s*\{([^{}]*)\}/g)) {
		if (/\b(?:border|background|box-shadow)\b/.test(m[1])) {
			warn(m.index, 'css-selector', '.base-editor: рамка, фон и тень перенесены на .base-editor__frame', SECTION.editorPickers)
		}
	}
	for (const m of code.matchAll(/--[\w-]+/g)) {
		if (CSS_TOKENS[m[0]]) warn(m.index, 'css-token', ...CSS_TOKENS[m[0]])
		else if (ALIAS_TOKENS.test(m[0]) && /^\s*:/.test(code.slice(m.index + m[0].length, m.index + m[0].length + 20))) {
			warn(
				m.index,
				'alias-token',
				`${m[0]}: компоненты читают только --rise-*, переопределение алиаса 1.x их не перекрашивает`,
				SECTION.order,
			)
		}
	}

	if (selfIsMediaTarget) {
		const found = styleImportsOf(src, isScss)[0]
		edits.push({
			start: found.end,
			end: found.end,
			text: `${found.eol}@import ${found.quote}${mediaSpecFor(found.spec)}${found.quote};`,
		})
	}
	return { edits, warnings }
}

/** Импорты стилей кита в CSS/SCSS (кроме media): позиция конца оператора, кавычка, перенос строки. */
function styleImportsOf(src, isScss) {
	const { code, strings } = maskCss(src, isScss)
	const strAt = new Map(strings.map(s => [s.start, s]))
	const eol = src.includes('\r\n') ? '\r\n' : '\n'
	const found = []
	for (const m of code.matchAll(STYLE_IMPORT_RE)) {
		const str = strAt.get(m.index + m[0].length)
		const spec = src.slice(str.start, str.end)
		if (!isStylesSpec(spec) && !isMediaCssSpec(spec)) continue
		const semi = code.indexOf(';', str.end)
		found.push({ spec, quote: str.quote, eol, end: semi < 0 ? str.end + 1 : semi + 1 })
	}
	return found
}

/** Части файла: скрипты, шаблоны и стили с позицией в файле. */
export function segmentsOf(file, text) {
	if (file.endsWith('.vue')) {
		return splitSfc(text).flatMap(block => {
			const content = text.slice(block.start, block.end)
			if (block.type === 'script') return [{ kind: 'script', text: content, offset: block.start }]
			if (block.type === 'template') return [{ kind: 'template', text: content, offset: block.start }]
			const lang = /lang\s*=\s*["']?(\w+)/.exec(block.attrs)?.[1] ?? 'css'
			return lang === 'css' || lang === 'scss' ? [{ kind: lang, text: content, offset: block.start }] : []
		})
	}
	if (file.endsWith('.scss')) return [{ kind: 'scss', text, offset: 0 }]
	if (file.endsWith('.css')) return [{ kind: 'css', text, offset: 0 }]
	return SCRIPT_EXT.test(file) && !file.endsWith('.d.ts') ? [{ kind: 'script', text, offset: 0 }] : []
}

/** Факты файла для проекта: плеер, импорт стилей, свои Transition, использование BaseAnimation. */
export function collectFacts(file, text) {
	const facts = {
		usesPlayer: false,
		firstPlayerAt: -1,
		hasStyles: false,
		hasMedia: false,
		usesAnimation: false,
		transitions: [],
		dynamicTransition: false,
	}
	const segments = segmentsOf(file, text)
	const markPlayer = at => {
		facts.usesPlayer = true
		if (facts.firstPlayerAt < 0) facts.firstPlayerAt = at
	}
	for (const seg of segments) {
		if (seg.kind === 'script') {
			const an = analyzeScript(seg.text)
			if (/\bBaseAnimation\b/.test(an.code)) facts.usesAnimation = true
			for (const ref of an.refs) {
				if (ref.kind === 'bare' && isStylesSpec(ref.spec)) facts.hasStyles = true
				if (isMediaCssSpec(ref.spec)) facts.hasMedia = true
				if (ref.kind !== 'import' || !isKitSpec(ref.spec)) continue
				for (const item of ref.clause.named) {
					const fromMedia = ref.spec === `${KIT}/media` && PLAYER_TAGS.includes(item.imported)
					const fromRoot = (ref.spec === KIT || ref.spec === `${KIT}/components`) && item.imported === 'BaseMediaPlayer'
					if (fromMedia || fromRoot) markPlayer(seg.offset + item.at)
				}
			}
			for (const m of an.code.matchAll(/<(?:Transition|TransitionGroup)\b/g)) {
				const name = /^[^>]*?\bname\s*=\s*(?:"([^"]+)"|'([^']+)'|\{)/.exec(an.src.slice(m.index, m.index + 300))
				if (!name) continue
				if (name[1] ?? name[2]) facts.transitions.push(name[1] ?? name[2])
				else facts.dynamicTransition = true
			}
		} else if (seg.kind === 'template') {
			for (const el of parseTemplate(seg.text)) {
				if (el.tag === 'BaseAnimation') facts.usesAnimation = true
				if (PLAYER_TAGS.includes(el.tag)) markPlayer(seg.offset + el.start)
				if (el.tag !== 'Transition' && el.tag !== 'TransitionGroup') continue
				for (const attr of el.attrs) {
					if (attr.key !== 'name' || attr.kind !== 'prop') continue
					if (attr.name === 'name') facts.transitions.push(attr.value)
					else facts.dynamicTransition = true
				}
			}
		} else {
			for (const found of styleImportsOf(seg.text, seg.kind === 'scss')) {
				if (isMediaCssSpec(found.spec)) facts.hasMedia = true
				else facts.hasStyles = true
			}
		}
	}
	return facts
}

/** Сводит факты файлов (в порядке имён) в общий контекст проекта. */
export function mergeFacts(entries) {
	const ctx = {
		usesPlayer: false,
		hasStyles: false,
		hasMedia: false,
		usesAnimation: false,
		ownTransitions: new Set(),
		ownTransitionDynamic: false,
		mediaTarget: null,
		noStylesFile: null,
		noStylesAt: -1,
	}
	for (const { facts } of entries) {
		ctx.usesPlayer ||= facts.usesPlayer
		ctx.hasStyles ||= facts.hasStyles
		ctx.hasMedia ||= facts.hasMedia
		ctx.usesAnimation ||= facts.usesAnimation
		ctx.ownTransitionDynamic ||= facts.dynamicTransition
		for (const name of facts.transitions) ctx.ownTransitions.add(name)
	}
	if (ctx.usesPlayer && !ctx.hasMedia) {
		ctx.mediaTarget = entries.find(e => e.facts.hasStyles)?.file ?? null
		const player = entries.find(e => e.facts.usesPlayer)
		ctx.noStylesFile = ctx.mediaTarget ? null : player.file
		ctx.noStylesAt = player.facts.firstPlayerAt
	}
	return ctx
}

function runPass(file, text, ctx, isFirst) {
	const segments = segmentsOf(file, text)
	const scripts = segments.filter(s => s.kind === 'script').map(seg => ({ seg, an: analyzeScript(seg.text) }))
	const foreign = new Set(scripts.flatMap(({ an }) => [...an.foreign]))
	const imported = new Set(scripts.flatMap(({ an }) => [...an.imported]))
	const edits = []
	const warnings = []
	let mediaDone = !(isFirst && ctx.mediaTarget === file)
	const collect = (seg, result) => {
		for (const e of result.edits) edits.push({ ...e, start: e.start + seg.offset, end: e.end + seg.offset })
		for (const w of result.warnings) warnings.push({ ...w, at: w.at + seg.offset })
	}
	for (const { seg, an } of scripts) {
		const take = !mediaDone && an.refs.some(r => r.kind === 'bare' && isStylesSpec(r.spec))
		collect(seg, scriptRules(an, take))
		mediaDone ||= take
	}
	for (const seg of segments) {
		if (seg.kind === 'template') {
			collect(seg, templateRules(seg.text, foreign, imported))
		} else if (seg.kind !== 'script') {
			const take = !mediaDone && styleImportsOf(seg.text, seg.kind === 'scss').length > 0
			collect(seg, cssRules(seg.text, seg.kind === 'scss', ctx, take))
			mediaDone ||= take
		}
	}
	return { edits, warnings }
}

/**
 * Преобразует файл: правки применяются до неподвижной точки (вложенные вызовы), поэтому повторный прогон ничего не меняет.
 * Предупреждения считаются по исходному тексту.
 */
export function transformFile(file, text, ctx) {
	const first = runPass(file, text, ctx, true)
	let result = applyEdits(text, first.edits)
	let count = first.edits.length
	for (let pass = 0; count > 0 && pass < 5; pass++) {
		const next = runPass(file, result, ctx, false)
		if (!next.edits.length) break
		result = applyEdits(result, next.edits)
		count += next.edits.length
	}
	const seen = new Set()
	const warnings = first.warnings
		.map(w => ({ line: lineAt(text, w.at), id: w.id, text: w.text, section: w.section }))
		.filter(w => !seen.has(`${w.line}:${w.text}`) && seen.add(`${w.line}:${w.text}`))
	if (ctx.noStylesFile === file) {
		warnings.push({
			line: lineAt(text, ctx.noStylesAt),
			id: 'player-styles',
			text: `плеер найден, но импорта ${KIT}/styles в просмотренных файлах нет: если стили кита подключены иначе, добавьте после них ${KIT}/media.css (в CSS: media.layer.css)`,
			section: SECTION.mediaCss,
		})
	}
	warnings.sort((a, b) => a.line - b.line)
	return { text: result, edits: count, warnings }
}
