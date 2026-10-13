import { resolve } from 'node:path'
import { compileString } from 'sass'
import { readFileSync } from 'node:fs'

const SRC = resolve(__dirname, '../../../..')
const STYLES = resolve(SRC, 'styles')
const PRELUDE = '@use "variables" as *; @use "mixins" as *; @use "functions" as *;\n'
const LOOP_STATE = 'animation-play-state: var(--rise-motion-loop-state, running)'
const LOOP_FILES = [
	'BaseLoader/styles/BaseLoader.style.scss',
	'BaseImage/styles/BaseImage.style.scss',
	'BaseSkeleton/styles/BaseSkeleton.style.scss',
	'BaseMarkdown/styles/BaseMarkdown.style.scss',
	'BaseProgress/styles/BaseProgress.style.scss',
]
const motionCss = compileString('@use "motion";', { loadPaths: [STYLES] }).css

function compileComponent(file: string): string {
	return compileString(PRELUDE + readFileSync(resolve(SRC, 'components', file), 'utf8'), { loadPaths: [STYLES] }).css
}

function rulesWithInfiniteLoop(css: string): string[] {
	return [...css.matchAll(/[^{}]+\{[^{}]*\}/g)].map(([rule]) => rule).filter(rule => /animation:[^;]*infinite/.test(rule))
}

let style: HTMLStyleElement

function tokenOf(element: Element | null): string {
	return getComputedStyle(element!).getPropertyValue('--rise-motion-loop-state').trim()
}

describe('--rise-motion-loop-state: пауза декоративных петель', () => {
	beforeAll(() => {
		style = document.createElement('style')
		style.textContent = motionCss
		document.head.append(style)
	})

	afterAll(() => style.remove())

	afterEach(() => {
		document.body.innerHTML = ''
		document.documentElement.removeAttribute('data-rise-reduced-motion')
	})

	it('по умолчанию и в пресетах subtle, standard, expressive петли идут', () => {
		document.body.innerHTML = ['subtle', 'standard', 'expressive']
			.map(preset => `<div data-rise-motion="${preset}"><i></i></div>`)
			.join('')

		expect(tokenOf(document.body)).toBe('running')
		for (const element of document.querySelectorAll('i')) expect(tokenOf(element)).toBe('running')
	})

	it('пресет none ставит петли на паузу, вложенная область с другим пресетом их возвращает', () => {
		document.body.innerHTML = '<div data-rise-motion="none"><i id="a"></i><div data-rise-motion="standard"><i id="b"></i></div></div>'

		expect(tokenOf(document.getElementById('a'))).toBe('paused')
		expect(tokenOf(document.getElementById('b'))).toBe('running')
	})

	it('reducedMotion: always ставит петли на паузу в любой области', () => {
		document.documentElement.setAttribute('data-rise-reduced-motion', 'always')
		document.body.innerHTML = '<div data-rise-motion="expressive"><i></i></div>'

		expect(tokenOf(document.querySelector('i'))).toBe('paused')
	})

	it('системное «уменьшить движение» обнуляет токен на :root и в областях', () => {
		expect(motionCss).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[^@]*--rise-motion-loop-state: paused/)
	})

	it.each(LOOP_FILES)('%s: каждая бесконечная петля, кроме спиннера, читает токен', file => {
		const loops = rulesWithInfiniteLoop(compileComponent(file)).filter(rule => !/-spin\b/.test(rule))

		expect(loops.length).toBeGreaterThan(0)
		for (const rule of loops) expect(rule).toContain(LOOP_STATE)
	})
})
