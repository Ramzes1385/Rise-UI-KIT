import { resolve } from 'node:path'
import { compileString } from 'sass'
import { readMotionDuration } from '../motionTokens'
import { MOTION_PRESETS } from '../types/useMotion.types'

const STYLES = resolve(__dirname, '../../../../styles')
const css = compileString('@use "motion";', { loadPaths: [STYLES], style: 'expanded' }).css

const TOKENS = [
	'--rise-duration-fast',
	'--rise-duration',
	'--rise-duration-slow',
	'--rise-duration-xslow',
	'--rise-ease-emphasized',
	'--rise-ease-spring',
	'--rise-motion-distance',
	'--rise-motion-scale-from',
	'--rise-motion-stagger',
]

function block(selector: string): Record<string, string> {
	const start = css.indexOf(`${selector} {`)
	const body = css.slice(start + selector.length + 2, css.indexOf('}', start))
	return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]))
}

function toMs(value: string): number {
	return value.endsWith('ms') ? Number.parseFloat(value) : Number.parseFloat(value) * 1000
}

let style: HTMLStyleElement

function mountArea(html: string): void {
	document.body.innerHTML = html
}

describe('пресеты движения (_motion.scss)', () => {
	beforeAll(() => {
		style = document.createElement('style')
		style.textContent = css
		document.head.append(style)
	})

	afterAll(() => style.remove())

	afterEach(() => {
		document.body.innerHTML = ''
		document.documentElement.removeAttribute('data-rise-reduced-motion')
	})

	it.each(MOTION_PRESETS)('пресет %s задаёт весь набор токенов', preset => {
		expect(Object.keys(block(`[data-rise-motion=${preset}][data-rise-motion]`))).toEqual(TOKENS)
	})

	it(':root — значения пресета standard (сегодняшние)', () => {
		expect(block(':root')).toEqual(block('[data-rise-motion=standard][data-rise-motion]'))
		expect(block(':root')['--rise-duration']).toBe('200ms')
	})

	it('пружина есть только в expressive и это linear() с перелётом не больше 6 %', () => {
		const spring = block('[data-rise-motion=expressive][data-rise-motion]')['--rise-ease-spring']
		const values = [...spring.matchAll(/(\d+(?:\.\d+)?)(?:\s+[\d.]+%)?/g)].map(([, value]) => Number(value))

		expect(spring.startsWith('linear(')).toBe(true)
		expect(Math.max(...values)).toBeGreaterThan(1)
		expect(Math.max(...values)).toBeLessThanOrEqual(1.06)
		expect(values.at(-1)).toBe(1)
		expect(block('[data-rise-motion=standard][data-rise-motion]')['--rise-ease-spring']).toMatch(/^cubic-bezier/)
	})

	it.each(['subtle', 'standard', 'expressive'] as const)('запасные значения JS совпадают со стилями: %s', preset => {
		const tokens = block(`[data-rise-motion=${preset}][data-rise-motion]`)
		style.disabled = true
		mountArea(`<div data-rise-motion="${preset}"><span></span></div>`)
		const el = document.querySelector('span')

		const durations = (['fast', 'base', 'slow', 'xslow'] as const).map(name => readMotionDuration(el, name))

		style.disabled = false
		expect(durations).toEqual(TOKENS.slice(0, 4).map(name => toMs(tokens[name])))
	})

	it('reduce и reducedMotion: always сильнее пресета на том же элементе и в поддереве', () => {
		expect(css).toMatch(
			/@media \(prefers-reduced-motion: reduce\) \{\s*:root,\s*\[data-rise-motion\]\[data-rise-motion\]\[data-rise-motion\] \{/,
		)
		expect(css).toContain(':root[data-rise-reduced-motion=always][data-rise-reduced-motion] [data-rise-motion] {')
	})

	it('пресет на поддереве пересчитывает токены: вложенная область берёт свой пресет', () => {
		mountArea('<div data-rise-motion="expressive"><p id="outer"></p><div data-rise-motion="subtle"><p id="inner"></p></div></div>')
		const outer = document.getElementById('outer')
		const inner = document.getElementById('inner')

		expect(getComputedStyle(outer!).getPropertyValue('--rise-duration-slow').trim()).toBe('420ms')
		expect(getComputedStyle(inner!).getPropertyValue('--rise-duration-slow').trim()).toBe('200ms')
		expect(getComputedStyle(inner!).getPropertyValue('--rise-motion-distance').trim()).toBe('4px')
		expect(readMotionDuration(outer, 'slow')).toBe(420)
		expect(readMotionDuration(inner, 'slow')).toBe(200)
	})

	it('reducedMotion: always — длительность 0 в любой области', () => {
		document.documentElement.setAttribute('data-rise-reduced-motion', 'always')
		mountArea('<div data-rise-motion="expressive"><p></p></div>')

		expect(readMotionDuration(document.querySelector('p'), 'slow')).toBe(0)
	})
})
