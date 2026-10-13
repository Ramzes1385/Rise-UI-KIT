import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { compileString } from 'sass-embedded'

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
	'BaseAvatar/styles/BaseAvatar.style.scss',
	'BaseReasoning/styles/BaseReasoning.style.scss',
	'BaseVoiceRecorder/styles/BaseVoiceRecorder.style.scss',
	'BaseMarquee/styles/BaseMarquee.style.scss',
	'BaseChat/ui/ChatHeader/ChatHeader.style.scss',
	'BaseImageMap/styles/BaseImageMap.style.scss',
	'BaseImageMap/styles/ImageMapRoutes.style.scss',
	'BaseMediaPlayer/styles/BaseMediaPlayer.style.scss',
	'BaseMediaPlayer/styles/MediaError.style.scss',
]
const SPINNER = /animation:\s*base-(loader|media-player|progress)-spin\b/
const STYLES_URL = pathToFileURL(`${STYLES}/`)
const importers = [
	{ findFileUrl: (url: string) => (url.startsWith('@styles/') ? new URL(url.slice('@styles/'.length), STYLES_URL) : null) },
]
const LOOP_STATE_LIST = 'animation-play-state: running, var(--rise-motion-loop-state, running)'
const motionCss = compileString('@use "motion";', { loadPaths: [STYLES] }).css

function compileComponent(file: string): string {
	const path = resolve(SRC, 'components', file)
	return compileString(PRELUDE + readFileSync(path, 'utf8'), { loadPaths: [STYLES], importers, url: pathToFileURL(path) }).css
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
		const loops = rulesWithInfiniteLoop(compileComponent(file)).filter(rule => !SPINNER.test(rule))

		expect(loops.length).toBeGreaterThan(0)
		for (const rule of loops) expect(rule.includes(LOOP_STATE) || rule.includes(LOOP_STATE_LIST)).toBe(true)
	})
})
