import { resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { compileString } from 'sass-embedded'

const STYLES = resolve(__dirname, '../../../styles')
const PRELUDE = '@use "variables" as *;\n@use "mixins" as *;\n@use "functions" as *;\n'
const source = readFileSync(resolve(__dirname, '../styles/BaseEmojiPicker.style.scss'), 'utf8')
const css = compileString(PRELUDE + source, { loadPaths: [STYLES], style: 'expanded' }).css
const pickerCss = css.slice(css.indexOf('\n.base-emoji-picker {'))
const motionCss = compileString('@use "motion";', { loadPaths: [STYLES], style: 'expanded' }).css

function rule(selector: string): string {
	const start = pickerCss.indexOf(`\n${selector} {`)
	return pickerCss.slice(start, pickerCss.indexOf('}', start))
}

function token(block: string, name: string): string | undefined {
	const start = motionCss.indexOf(block)
	return motionCss.slice(start, motionCss.indexOf('}', start)).match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]
}

describe('BaseEmojiPicker: движение', () => {
	it('ячейка эмодзи сглаживает фон наведения и нажатие на токенах движения', () => {
		const body = rule('.base-emoji-picker__emoji')

		expect(body).toContain('transition-property: color, background-color, box-shadow, transform')
		expect(body).toContain('transition-duration: var(--rise-duration-fast)')
		expect(body).toContain('transition-timing-function: var(--rise-ease)')
	})

	it('нажатие на ячейку сжимает её только без «уменьшить движение»', () => {
		const media = pickerCss.indexOf('@media (prefers-reduced-motion: no-preference)')

		expect(media).toBeGreaterThan(-1)
		const block = pickerCss.slice(media, pickerCss.indexOf('\n}', media))
		expect(block).toMatch(/\.base-emoji-picker__emoji:active \{\s*transform: scale\(0\.9\);/)
		expect(pickerCss.slice(0, media)).not.toContain('scale(')
	})

	it('вкладка раздела меняет цвета на токенах движения', () => {
		const body = rule('.base-emoji-picker__tab')

		expect(body).toMatch(/transition-property: color, background-color, border-color/)
		expect(body).toContain('transition-duration: var(--rise-duration-fast)')
	})

	it('в стилях нет литеральных длительностей, кривых и анимации размеров', () => {
		const transitions = [...pickerCss.matchAll(/transition[\w-]*:\s*([^;]+);/g)].map(([, value]) => value)

		expect(transitions.join(' ')).not.toMatch(/\d(m?s)\b|\bease(-in|-out|-in-out)?\b(?!\))/)
		expect(pickerCss).not.toMatch(/transition-property:[^;]*\b(width|height|top|left|margin|padding)\b/)
	})

	it.each([
		['пресет none', '[data-rise-motion=none][data-rise-motion]'],
		['prefers-reduced-motion: reduce', '@media (prefers-reduced-motion: reduce)'],
		["reducedMotion: 'always'", ':root[data-rise-reduced-motion=always][data-rise-reduced-motion]'],
	])('%s — токен длительности почти нулевой: наведение и нажатие сразу в конечном состоянии', (_, block) => {
		expect(token(block, '--rise-duration-fast')).toBe('0.01ms')
	})
})
