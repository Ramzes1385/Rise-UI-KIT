import { resolve } from 'node:path'
import { compileString } from 'sass'
import { readFileSync } from 'node:fs'

const STYLES = resolve(__dirname, '../../../styles')
const PRELUDE = '@use "variables" as *;\n@use "mixins" as *;\n@use "functions" as *;\n'
const source = readFileSync(resolve(__dirname, '../styles/BaseMenu.style.scss'), 'utf8')
const css = compileString(PRELUDE + source, { loadPaths: [STYLES], style: 'expanded' }).css
const menuCss = css.slice(css.indexOf('\n.base-menu {'))
const motionCss = compileString('@use "motion";', { loadPaths: [STYLES], style: 'expanded' }).css

function rule(selector: string): string {
	const start = menuCss.indexOf(`\n${selector} {`)
	return menuCss.slice(start, menuCss.indexOf('}', start))
}

function token(block: string, name: string): string | undefined {
	const start = motionCss.indexOf(block)
	return motionCss.slice(start, motionCss.indexOf('}', start)).match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]
}

describe('BaseMenu: движение', () => {
	it.each(['.base-menu', '.base-menu__item', '.base-menu__icon'])('%s сглаживает только цвета на токенах движения', selector => {
		const body = rule(selector)

		expect(body).toMatch(/transition-property: color, background-color, border-color/)
		expect(body).toContain('transition-duration: var(--rise-duration-fast)')
		expect(body).toContain('transition-timing-function: var(--rise-ease)')
	})

	it('в стилях нет литеральных длительностей, кривых и анимации размеров', () => {
		const transitions = [...menuCss.matchAll(/transition[\w-]*:\s*([^;]+);/g)].map(([, value]) => value)

		expect(transitions.join(' ')).not.toMatch(/\d(m?s)\b|\bease(-in|-out|-in-out)?\b(?!\))/)
		expect(menuCss).not.toMatch(/transition-property:[^;]*\b(width|height|top|left|margin|padding)\b/)
		expect(menuCss).not.toMatch(/animation/)
	})

	it.each([
		['пресет none', '[data-rise-motion=none][data-rise-motion]'],
		['prefers-reduced-motion: reduce', '@media (prefers-reduced-motion: reduce)'],
		["reducedMotion: 'always'", ':root[data-rise-reduced-motion=always][data-rise-reduced-motion]'],
	])('%s — токен длительности почти нулевой: hover и нажатие сразу в конечном цвете', (_, block) => {
		expect(token(block, '--rise-duration-fast')).toBe('0.01ms')
	})
})
