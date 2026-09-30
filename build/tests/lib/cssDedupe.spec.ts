import { describe, expect, it } from 'vitest'
import { removeDuplicateMediaBlocks, splitTopLevelBlocks } from '../../plugins/cssDedupe'

const DARK = '@media (prefers-color-scheme:dark){[data-theme=system]{--rise-bg:#111}}'
const MOTION = '@media (prefers-reduced-motion:reduce){:root{--rise-duration:.01ms}}'

describe('повторы @media в собранных стилях', () => {
	it('делит CSS на блоки верхнего уровня', () => {
		expect(splitTopLevelBlocks('@charset "utf-8";.a{color:red}@media (width>1px){.b{top:0}}')).toEqual([
			'@charset "utf-8";',
			'.a{color:red}',
			'@media (width>1px){.b{top:0}}',
		])
	})

	it('не считает скобки внутри строк, комментариев и экранированных символов', () => {
		const css = ".a:after{content:\"}{\"}/* } */.b\\{{top:0}.c{content:'\\'}'}"
		expect(splitTopLevelBlocks(css)).toEqual(['.a:after{content:"}{"}', '/* } */.b\\{{top:0}', ".c{content:'\\'}'}"])
	})

	it('оставляет последний из одинаковых блоков @media', () => {
		const css = `${DARK}.a{color:red}${MOTION}.b{color:blue}:root{--rise-bg:#fff}${DARK}${MOTION}`
		expect(removeDuplicateMediaBlocks(css)).toBe(`.a{color:red}.b{color:blue}:root{--rise-bg:#fff}${DARK}${MOTION}`)
	})

	it('не трогает разные блоки @media и повторы обычных правил', () => {
		const css = `.a{color:red}.a{color:red}@media (width>1px){.a{top:0}}@media (width>2px){.a{top:0}}`
		expect(removeDuplicateMediaBlocks(css)).toBe(css)
	})

	it('возвращает хвост без закрывающей скобки как есть', () => {
		expect(removeDuplicateMediaBlocks(`${DARK}.a{color:red`)).toBe(`${DARK}.a{color:red`)
	})
})
