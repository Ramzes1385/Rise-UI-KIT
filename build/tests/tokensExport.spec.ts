import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { compile } from 'sass-embedded'
import { createTheme, KIT_PALETTES, THEME_PRESET_NAMES, THEME_PRESETS, THEME_ROLES, THEME_SHADES } from '@utils/theme/themeUtils'
import { buildTokenDocument, buildTokenFiles, writeTokenFiles } from '../tokens/buildTokens.ts'
import { evaluateCalc, parseColor, resolveValue, splitTopLevel, substituteVars, toHex } from '../tokens/cssValue.ts'
import { readTokenDeclarations } from '../tokens/readTokensScss.ts'
import { describeToken } from '../tokens/tokenMap.ts'
import type { TokenDocument, TokenFile, TokenMode } from '../tokens/types.ts'

const SCSS = resolve(import.meta.dirname, '../../src/styles/_tokens.scss')
const RESERVED = new Set(['$value', '$type', '$description', '$extensions'])
const TYPES = new Set(['color', 'dimension', 'fontFamily', 'fontWeight', 'duration', 'cubicBezier', 'number', 'shadow', 'gradient'])
const HEX = /^#[\da-f]{6}(?:[\da-f]{2})?$/
const ALIAS = /^\{([^{}.]+(?:\.[^{}.]+)*)\}$/

interface FlatToken {
	$value: unknown
	$type: string
	$extensions?: { 'rise-ui-kit'?: { cssVariable?: string } }
}

let files: TokenFile[]
let declaredNames: string[]

const themes = THEME_PRESET_NAMES.map(name => createTheme(THEME_PRESETS[name]))
const byPath = (path: string): TokenFile => files.find(file => file.path === path) as TokenFile

function isToken(node: unknown): node is FlatToken {
	return typeof node === 'object' && node !== null && '$value' in node
}

function flatten(document: TokenDocument): Map<string, FlatToken> {
	const found = new Map<string, FlatToken>()
	const visit = (node: Record<string, unknown>, path: string[]): void => {
		for (const [key, child] of Object.entries(node)) {
			if (key.startsWith('$')) {
				expect(RESERVED.has(key), `служебное поле ${key} в ${path.join('.')}`).toBe(true)
				continue
			}
			expect(key, `имя ${path.join('.')}.${key}`).toMatch(/^[^.{}$\s][^.{}\s]*$/)
			if (isToken(child)) found.set([...path, key].join('.'), child)
			else visit(child as Record<string, unknown>, [...path, key])
		}
	}
	visit(document, [])
	return found
}

function resolveToken(tokens: Map<string, FlatToken>, path: string): FlatToken {
	let token = tokens.get(path) as FlatToken
	for (let depth = 0; typeof token.$value === 'string' && ALIAS.test(token.$value); depth += 1) {
		expect(depth, `цикл ссылок у ${path}`).toBeLessThan(20)
		const target = tokens.get((ALIAS.exec(token.$value) as RegExpExecArray)[1])
		expect(target, `ссылка ${String(token.$value)} у ${path}`).toBeDefined()
		token = target as FlatToken
	}
	return token
}

function expectValidValue(token: FlatToken, where: string): void {
	const value = token.$value
	const note = `${where}: ${JSON.stringify(value)}`
	if (typeof value === 'string' && ALIAS.test(value)) return
	switch (token.$type) {
		case 'color':
			expect(value, note).toMatch(HEX)
			break
		case 'dimension':
			expect(value, note).toMatch(where.startsWith('font.tracking.') ? /^-?\d+(?:\.\d+)?em$/ : /^-?\d+(?:\.\d+)?(?:px|rem)$/)
			break
		case 'duration':
			expect(value, note).toMatch(/^\d+(?:\.\d+)?(?:ms|s)$/)
			break
		case 'fontFamily':
			expect(Array.isArray(value) && value.length > 0 && value.every(item => typeof item === 'string' && item !== ''), note).toBe(
				true,
			)
			break
		case 'fontWeight':
			expect(value, note).toBeGreaterThanOrEqual(1)
			expect(value, note).toBeLessThanOrEqual(1000)
			break
		case 'number':
			expect(Number.isFinite(value), note).toBe(true)
			break
		case 'cubicBezier': {
			const points = value as number[]
			expect(points, note).toHaveLength(4)
			expect(points.every(Number.isFinite) && points[0] >= 0 && points[0] <= 1 && points[2] >= 0 && points[2] <= 1, note).toBe(true)
			break
		}
		case 'shadow':
			for (const layer of value as Record<string, string>[]) {
				expect(layer.color, note).toMatch(HEX)
				for (const key of ['offsetX', 'offsetY', 'blur', 'spread']) expect(layer[key], note).toMatch(/^-?\d+(?:\.\d+)?px$/)
			}
			break
		case 'gradient':
			for (const stop of value as { color: string; position: number }[]) {
				expect(stop.color, note).toMatch(HEX)
				expect(stop.position, note).toBeGreaterThanOrEqual(0)
				expect(stop.position, note).toBeLessThanOrEqual(1)
			}
			break
		default:
			expect.unreachable(`неизвестный тип ${token.$type}`)
	}
}

function hex(value: string): string {
	return toHex(parseColor(value))
}

function valueAt(path: string, name: string, tokens = flatten(byPath(path).document)): unknown {
	return resolveToken(tokens, name).$value
}

beforeAll(() => {
	files = buildTokenFiles(readTokenDeclarations(SCSS), themes)
	const css = compile(SCSS, { style: 'expanded' }).css
	declaredNames = [...new Set([...css.matchAll(/(--rise-[\w-]+)\s*:/g)].map(match => match[1]))].sort()
}, 60_000)

describe('экспорт токенов: состав', () => {
	it('файлы: tokens.json и по файлу на тему и режим', () => {
		expect(files.map(file => file.path).sort()).toEqual(
			['tokens.json', ...THEME_PRESET_NAMES.flatMap(name => [`tokens/${name}.dark.json`, `tokens/${name}.light.json`])].sort(),
		)
	})

	it('в _tokens.scss есть токены, и их много', () => {
		expect(declaredNames.length).toBeGreaterThan(200)
	})

	it.each(['tokens.json', ...THEME_PRESET_NAMES.flatMap(name => [`tokens/${name}.light.json`, `tokens/${name}.dark.json`])])(
		'%s: каждая переменная --rise-* из _tokens.scss есть в токенах, лишних нет',
		path => {
			const exported = [...flatten(byPath(path).document).values()].map(
				token => token.$extensions?.['rise-ui-kit']?.cssVariable as string,
			)
			expect([...exported].sort()).toEqual(declaredNames)
			expect(new Set(exported).size).toBe(exported.length)
		},
	)
})

describe('экспорт токенов: структура W3C', () => {
	it.each(['tokens.json', ...THEME_PRESET_NAMES.flatMap(name => [`tokens/${name}.light.json`, `tokens/${name}.dark.json`])])(
		'%s: типы, значения и ссылки допустимы',
		path => {
			const tokens = flatten(byPath(path).document)
			for (const [name, token] of tokens) {
				expect(TYPES.has(token.$type), `${name}: тип ${token.$type}`).toBe(true)
				expectValidValue(token, name)
				const target = typeof token.$value === 'string' ? ALIAS.exec(token.$value)?.[1] : undefined
				if (target) expect(resolveToken(tokens, name).$type, `${name} → ${target}`).toBe(token.$type)
			}
		},
	)

	it('JSON из файла разбирается обратно в тот же документ', () => {
		const dir = mkdtempSync(join(tmpdir(), 'rise-tokens-'))
		try {
			writeTokenFiles(dir, files)
			for (const file of files) expect(JSON.parse(readFileSync(join(dir, file.path), 'utf8'))).toEqual(file.document)
		} finally {
			rmSync(dir, { recursive: true, force: true })
		}
	})

	it('результат не зависит от запуска: два прогона дают одно и то же', () => {
		const again = buildTokenFiles(readTokenDeclarations(SCSS), themes)
		expect(JSON.stringify(again)).toBe(JSON.stringify(files))
	})

	it('тема rise в светлом режиме совпадает с базовым tokens.json по токенам', () => {
		expect(flatten(byPath('tokens/rise.light.json').document)).toEqual(flatten(byPath('tokens.json').document))
	})

	it('у токена без правила пути — понятная ошибка', () => {
		expect(() => describeToken('--rise-unknown-thing', '1px')).toThrow(/tokenMap/)
	})
})

describe('экспорт токенов: значения совпадают с вычисленными', () => {
	const modes: TokenMode[] = ['light', 'dark']

	it.each(['rise', 'corporate', 'minimal'] as const)('%s: палитры совпадают с createTheme и палитрами кита', name => {
		const theme = createTheme(THEME_PRESETS[name])
		for (const mode of modes) {
			const tokens = flatten(byPath(`tokens/${name}.${mode}.json`).document)
			const dark = mode === 'dark' ? theme.darkVars : {}
			for (const role of THEME_ROLES) {
				for (const shade of THEME_SHADES) {
					const variable = `--rise-color-${role}-${shade}`
					const expected = dark[variable] ?? theme.vars[variable] ?? KIT_PALETTES[role][shade]
					expect(valueAt('', `palette.${role}.${shade}`, tokens), `${name} ${mode} ${variable}`).toBe(hex(expected))
				}
			}
			const neutralZero = theme.vars['--rise-color-neutral-0'] ?? KIT_PALETTES.neutral[0]
			expect(valueAt('', 'palette.neutral.0', tokens)).toBe(hex(neutralZero))
		}
	})

	it('светлая семантика — ссылки на палитру, тёмная — на другие оттенки и смеси шагов', () => {
		const light = flatten(byPath('tokens/rise.light.json').document)
		const dark = flatten(byPath('tokens/rise.dark.json').document)
		expect(light.get('color.bg')?.$value).toBe('{palette.neutral.0}')
		expect(dark.get('color.bg-elevated')?.$value).toBe('{palette.neutral.900}')
		expect(valueAt('', 'color.bg', dark)).toBe('#08090f')
		expect(valueAt('', 'color.surface-raised', dark)).toBe('#1b1e29')
		expect(light.get('color.primary')?.$value).toBe('{palette.primary.600}')
		expect(dark.get('color.primary')?.$value).toBe('{palette.primary.500}')
		expect(light.get('color.info')?.$value).toBe('{palette.info.600}')
		expect(light.get('color.field-bg')?.$value).toBe('{color.bg-elevated}')
		expect(valueAt('', 'color.on-primary', light)).toBe('#0b0d14')
		expect(valueAt('', 'color.focus-ring', dark)).toBe(valueAt('', 'palette.primary.500', dark))
		expect(valueAt('', 'font.tracking.label', light)).toBe('0.12em')
	})

	it('minimal: чёрный бренд светлой темы и светлая кнопка тёмной (primaryDark)', () => {
		const theme = createTheme(THEME_PRESETS.minimal)
		const light = flatten(byPath('tokens/minimal.light.json').document)
		const dark = flatten(byPath('tokens/minimal.dark.json').document)
		expect(valueAt('', 'color.primary', light)).toBe(hex(theme.vars['--rise-color-primary-600']))
		expect(valueAt('', 'color.on-primary', light)).toBe('#ffffff')
		expect(valueAt('', 'color.primary', dark)).toBe(hex(theme.darkVars['--rise-color-primary-500']))
		expect(valueAt('', 'color.primary', dark)).toBe('#e4e4e7')
	})

	it('color-mix считается в sRGB: мягкий фон тёмной роли и подложки медиа', () => {
		const dark = flatten(byPath('tokens/rise.dark.json').document)
		expect(valueAt('', 'color.primary-soft', dark)).toBe('#2b1711')
		expect(valueAt('', 'media.backdrop', dark)).toBe('#08090fe0')
		expect(valueAt('', 'media.text-toned', dark)).toBe('#f3f5ffd9')
	})

	it('форма: скругление, плотность и производные размеры по литералам темы', () => {
		const expected = {
			rise: ['4px', '6px', '7px'],
			corporate: ['2px', '3px', '5.25px'],
			playful: ['8px', '12px', '8.75px'],
			minimal: ['0px', '0px', '7px'],
		}
		for (const name of THEME_PRESET_NAMES) {
			const tokens = flatten(byPath(`tokens/${name}.light.json`).document)
			expect([
				valueAt('', 'radius.base', tokens),
				valueAt('', 'radius.md', tokens),
				valueAt('', 'control.padding-y', tokens),
			]).toEqual(expected[name])
		}
		const tokens = flatten(byPath('tokens/corporate.light.json').document)
		expect(valueAt('', 'radius.xl', tokens)).toBe('6px')
		expect(valueAt('', 'density', tokens)).toBe(0.75)
		expect(valueAt('', 'radius.sm', tokens)).toBe('2px')
	})

	it('тени: прозрачность = доля режима × сила темы', () => {
		const alpha = (name: string, mode: TokenMode): string[] =>
			(valueAt('', 'shadow.sm', flatten(byPath(`tokens/${name}.${mode}.json`).document)) as { color: string }[]).map(
				layer => layer.color,
			)
		expect(alpha('rise', 'light')).toEqual(['#0b0d1414'])
		expect(alpha('rise', 'dark')).toEqual(['#00000080'])
		expect(alpha('corporate', 'light')).toEqual(['#0b0d140c'])
		expect(alpha('minimal', 'light')).toEqual(['#0b0d1400'])
		expect(valueAt('', 'shadow.strength', flatten(byPath('tokens/playful.light.json').document))).toBe(1.8)
	})

	it('шрифты, длительности и кривая — из литералов темы', () => {
		const corporate = flatten(byPath('tokens/corporate.light.json').document)
		expect(valueAt('', 'font.family.sans', corporate)).toEqual(['Rise Grotesk', 'sans-serif'])
		expect(valueAt('', 'font.family.heading', corporate)).toEqual(['Rise Grotesk', 'sans-serif'])
		expect(['fast', 'base', 'slow'].map(key => valueAt('', `duration.${key}`, corporate))).toEqual(['100ms', '150ms', '200ms'])
		expect(valueAt('', 'easing.base', corporate)).toEqual([0.2, 0, 0, 1])
		const minimal = flatten(byPath('tokens/minimal.dark.json').document)
		expect(['fast', 'base', 'slow'].map(key => valueAt('', `duration.${key}`, minimal))).toEqual(['0.01ms', '0.01ms', '0.01ms'])
		expect(valueAt('', 'easing.base', minimal)).toEqual([0, 0, 1, 1])
		expect(valueAt('', 'duration.loop', minimal)).toBe('1s')
		const rise = flatten(byPath('tokens.json').document)
		expect(valueAt('', 'font.family.mono', rise)).toEqual(['Rise Mono', 'monospace'])
		expect(valueAt('', 'duration.slow', rise)).toBe('320ms')
		expect(valueAt('', 'control.height', rise)).toBe('36px')
		expect(valueAt('', 'font.size.base', rise)).toBe('16px')
		expect(valueAt('', 'font.weight.semibold', rise)).toBe(600)
		expect(valueAt('', 'z-index.toast', rise)).toBe(2000)
	})

	it('градиент: остановки и исходная запись CSS', () => {
		const tokens = flatten(byPath('tokens.json').document)
		const sky = tokens.get('media.error-sky') as FlatToken
		expect(sky.$type).toBe('gradient')
		expect((sky.$value as { position: number }[]).map(stop => stop.position)).toEqual([0, 0.4, 0.58, 0.584, 1])
		expect(sky.$extensions?.['rise-ui-kit']).toMatchObject({ css: expect.stringMatching(/^linear-gradient\(to bottom, /) })
	})

	it('документ одной темы можно построить без файлов', () => {
		const declarations = readTokenDeclarations(SCSS)
		const document = buildTokenDocument(declarations, 'dark', themes[0])
		expect(document.$extensions).toEqual({ 'rise-ui-kit': { theme: 'rise', mode: 'dark' } })
	})
})

describe('вычисление значений CSS', () => {
	const env = new Map([
		['--a', '4px'],
		['--b', 'var(--a)'],
		['--k', '1.5'],
	])

	it('var() с цепочкой, запасным значением и ошибками', () => {
		expect(substituteVars('var(--b)', env)).toBe('4px')
		expect(substituteVars('var(--missing, 7px)', env)).toBe('7px')
		expect(() => substituteVars('var(--missing)', env)).toThrow(/--missing/)
		expect(() => substituteVars('var(--x)', new Map([['--x', 'var(--x)']]))).toThrow(/Цикл/)
	})

	it('calc(): произведение, сумма, скобки, вложенность и единицы', () => {
		expect(evaluateCalc('calc(4px * 1.5)')).toBe('6px')
		expect(evaluateCalc('calc(10% * 0.6)')).toBe('6%')
		expect(evaluateCalc('calc((2px + 3px) * 2)')).toBe('10px')
		expect(evaluateCalc('calc(calc(1px * 3) / 2)')).toBe('1.5px')
		expect(resolveValue('calc(var(--b) * var(--k))', env)).toBe('6px')
		expect(() => evaluateCalc('calc(1px * 2px)')).toThrow()
		expect(() => evaluateCalc('calc(1px + 2s)')).toThrow()
		expect(() => evaluateCalc('calc(1px / 2px)')).toThrow()
		expect(() => evaluateCalc('calc(1px 2px)')).toThrow()
	})

	it('цвета: HEX, rgb(), прозрачность, color-mix и ошибки', () => {
		expect(toHex(parseColor('#fc0'))).toBe('#ffcc00')
		expect(toHex(parseColor('rgb(18 18 18 / 86%)'))).toBe('#121212db')
		expect(toHex(parseColor('rgba(255, 0, 0, 0.5)'))).toBe('#ff000080')
		expect(toHex(parseColor('color-mix(in srgb, #000 88%, transparent)'))).toBe('#000000e0')
		expect(toHex(parseColor('color-mix(in srgb, #fff, #000)'))).toBe('#808080')
		expect(toHex(parseColor('color-mix(in srgb, #fff 30%, #000 30%)'))).toBe('#80808099')
		expect(() => parseColor('oklch(0.5 0.1 20)')).toThrow(/Неподдерживаемый/)
		expect(() => parseColor('color-mix(in oklch, red, blue)')).toThrow(/srgb/)
		expect(() => parseColor('#12')).toThrow(/HEX/)
	})

	it('разделение по запятым вне скобок и кавычек', () => {
		expect(splitTopLevel('a, rgb(0, 0, 0), "b, c", d', ',')).toEqual(['a', 'rgb(0, 0, 0)', '"b, c"', 'd'])
	})
})
