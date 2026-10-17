/** Кодмод `rise-ui-kit migrate`: маски кода, разбор шаблона Vue, блоки .vue и diff. */

import { describe, expect, it } from 'vitest'

import { unifiedDiff } from '../../bin/migrate/diff.mjs'
import { classifyAttr, lineAt, maskCss, maskScript, parseTemplate, slotsOf, splitSfc, toKebab, toPascal } from '../../bin/migrate/lex.mjs'

const mask = (src: string) => maskScript(src).code

/** Ожидаемая маска: заданные фрагменты (по порядку, первое вхождение после предыдущего) заменены пробелами, переводы строк целы. */
function blanked(src: string, ...parts: string[]): string {
	let out = src
	let from = 0
	for (const part of parts) {
		const at = out.indexOf(part, from)
		if (at < 0) throw new Error(`нет фрагмента ${part}`)
		out = out.slice(0, at) + part.replace(/[^\n]/g, ' ') + out.slice(at + part.length)
		from = at + part.length
	}
	return out
}

describe('maskScript', () => {
	it('затирает комментарии, сохраняя длину и переводы строк', () => {
		const src = 'a // \'x\'\nb /* "y"\n z */ c /* не закрыт'
		const code = mask(src)
		expect(code).toHaveLength(src.length)
		expect(code).toBe(blanked(src, "// 'x'", '/* "y"\n z */', '/* не закрыт'))
		expect(mask('x // до конца файла')).toBe(blanked('x // до конца файла', '// до конца файла'))
	})

	it('затирает тело строк, кавычки остаются, позиции содержимого записываются', () => {
		const src = `const a = 'x\\'y', b = "z"; const c = 'не закрыта\nnext`
		const { code, strings } = maskScript(src)
		expect(code).toBe(blanked(src, "x\\'y", 'z', 'не закрыта'))
		const first = src.indexOf("'x") + 1
		const second = src.indexOf('"z"') + 1
		expect(strings.slice(0, 2)).toEqual([
			{ start: first, end: first + 4, quote: "'" },
			{ start: second, end: second + 1, quote: '"' },
		])
		expect(maskScript("'без конца").code).toBe(blanked("'без конца", 'без конца'))
	})

	it('шаблонные строки: текст затёрт, код в ${…} виден, вложенные шаблоны и фигурные скобки разобраны', () => {
		const nested = 'x = `a ${ fn(`b ${c}`, { k: 1 }.k) } d` + y'
		expect(mask(nested)).toBe(blanked(nested, 'a ', 'b ', ' d'))
		const escaped = '`\\${не код} \\` ещё`; z'
		expect(mask(escaped)).toBe(blanked(escaped, '\\${не код} \\` ещё'))
		expect(mask('`не закрыт ${ a')).toBe(blanked('`не закрыт ${ a', 'не закрыт '))
		expect(mask('`не закрыт')).toBe(blanked('`не закрыт', 'не закрыт'))
		expect(mask('`a${ b }')).toBe(blanked('`a${ b }', 'a'))
	})

	it('регулярные выражения: кавычки внутри затёрты, деление остаётся кодом', () => {
		const withRegex = "const re = /'[/]\\//g; const q = 'z'"
		expect(mask(withRegex)).toBe(blanked(withRegex, "'[/]\\/", 'z'))
		expect(mask('x = a / b / c; y = (a) / 2 / 3; z = arr[0] / 4')).toBe('x = a / b / c; y = (a) / 2 / 3; z = arr[0] / 4')
		expect(mask("return /'/.test(s)")).toBe(blanked("return /'/.test(s)", "'"))
		expect(mask("/'/.test(s)")).toBe(blanked("/'/.test(s)", "'"))
		expect(mask("a = /не закрыто\nb = 'x'")).toBe(blanked("a = /не закрыто\nb = 'x'", 'x'))
		expect(mask('if (x) y = 1 /* c */ / 2')).toBe(blanked('if (x) y = 1 /* c */ / 2', '/* c */'))
		expect(mask('v = n / typeofx / 2')).toBe('v = n / typeofx / 2')
	})

	it('лишние закрывающие скобки не ломают разбор', () => {
		expect(mask("} 'a'")).toBe(blanked("} 'a'", 'a'))
	})
})

describe('maskCss', () => {
	it('затирает комментарии и строки; строчные // — только в SCSS и не внутри адресов', () => {
		const scss = "a { b: url(http://x.y/z); // c\n  d: '//e'; /* f */ g: h } // end\n// первая\n.x{color:red}/* не закрыт"
		const code = maskCss(scss, true).code
		expect(code).toContain('url(http://x.y/z);')
		expect(code).not.toContain('// c')
		expect(code).not.toContain('//e')
		expect(code).not.toContain('f */')
		expect(code).not.toContain('первая')
		expect(code).toContain('.x{color:red}')
		expect(maskCss('a { b: url(//cdn/x.png) }', true).code).toBe('a { b: url(//cdn/x.png) }')
		expect(maskCss('// комментарий в самом начале', true).code.trim()).toBe('')
		expect(maskCss('a { b: c } // тут', true).code.trim()).toBe('a { b: c }')
		expect(maskCss('a { b: c; // до конца файла', true).code).toBe(blanked('a { b: c; // до конца файла', '// до конца файла'))
		expect(maskCss('// в CSS это не комментарий', false).code).toContain('//')
		const cssSrc = 'a::before { content: \'не закрыта\n} b { c: "d\\"e" }'
		const css = maskCss(cssSrc, false)
		expect(css.code).toBe(blanked(cssSrc, 'не закрыта', 'd\\"e'))
		expect(css.strings).toHaveLength(2)
		expect(maskCss('/* а', false).code).toBe(blanked('/* а', '/* а'))
		expect(maskCss('/* a\r\n b */ .x', false).code).toBe('    \r\n      .x')
	})
})

describe('parseTemplate', () => {
	it('теги, атрибуты всех видов, самозакрывающиеся и пустые теги', () => {
		const src = `<BaseA x="1" y='2' z=3 flag :a.b="c > d" @e="f" #g v-slot:h v-slot><input disabled><br/><img src="a.png" /></BaseA>`
		const [a, input, br, img] = parseTemplate(src)
		expect(a.tag).toBe('BaseA')
		expect(a.attrs.map((x: { name: string; value?: string }) => [x.name, x.value])).toEqual([
			['x', '1'],
			['y', '2'],
			['z', '3'],
			['flag', undefined],
			[':a.b', 'c > d'],
			['@e', 'f'],
			['#g', undefined],
			['v-slot:h', undefined],
			['v-slot', undefined],
		])
		expect(a.attrs.map((x: { kind: string; key: string }) => `${x.kind}:${x.key}`).slice(3)).toEqual([
			'prop:flag',
			'prop:a',
			'event:e',
			'slot:g',
			'slot:h',
			'slot:default',
		])
		expect(a.children).toEqual([input, br, img])
		expect(br.selfClosing).toBe(true)
		expect(src.slice(a.start, a.openEnd)).toBe(src.slice(0, src.indexOf('><input') + 1))
		expect(a.closeStart).toBe(src.indexOf('</BaseA>'))
		expect(input.closeStart).toBe(-1)
	})

	it('комментарии, текст со знаком <, регистр закрывающего тега, закрывающий тег без пары', () => {
		const src = `<div><!-- <Hidden x="1"> --><p>a < b</p></DIV></span><i>`
		const tags = parseTemplate(src).map((e: { name: string }) => e.name)
		expect(tags).toEqual(['div', 'p', 'i'])
		const [div] = parseTemplate(src)
		expect(div.closeStart).toBe(src.indexOf('</DIV>'))
		expect(parseTemplate('<!-- не закрыт <a>').length).toBe(0)
	})

	it('обрывы разметки не приводят к ошибке', () => {
		expect(parseTemplate('<a href="x"')).toEqual([])
		expect(parseTemplate('<a b="1" ! c>')[0].attrs.map((x: { name: string }) => x.name)).toEqual(['b', '!', 'c'])
		expect(parseTemplate('<a = b / c>')[0].attrs.map((x: { name: string }) => x.name)).toEqual(['b', 'c'])
		expect(parseTemplate('<a><b></a><c>').map((e: { name: string; closeStart: number }) => [e.name, e.closeStart])).toEqual([
			['a', 6],
			['b', -1],
			['c', -1],
		])
		const [a] = parseTemplate('<a>текст</a')
		expect(a.closeStart).toBe(8)
	})

	it('hasText: прямой текст внутри элемента, без учёта комментариев и вложенных тегов', () => {
		const [outer, , second] = parseTemplate('<A> <!-- x --> <B>t</B></A><C>  </C><D>{{ v }}</D>')
		expect(outer.hasText).toBe(false)
		expect(second.hasText).toBe(false)
		const all = parseTemplate('<A>text</A><C>  </C><D>{{ v }}</D>')
		expect(all.map((e: { hasText: boolean }) => e.hasText)).toEqual([true, false, true])
	})
})

describe('classifyAttr и slotsOf', () => {
	it('классификация атрибутов и имена в kebab-case', () => {
		expect(classifyAttr('sizeScale')).toEqual({ kind: 'prop', key: 'size-scale' })
		expect(classifyAttr(':sizeScale')).toEqual({ kind: 'prop', key: 'size-scale' })
		expect(classifyAttr('v-bind:size-scale')).toEqual({ kind: 'prop', key: 'size-scale' })
		expect(classifyAttr('v-bind')).toEqual({ kind: 'prop', key: 'v-bind' })
		expect(classifyAttr('@itemClick.once')).toEqual({ kind: 'event', key: 'item-click' })
		expect(classifyAttr('v-on:confirm')).toEqual({ kind: 'event', key: 'confirm' })
		expect(classifyAttr('#column-title')).toEqual({ kind: 'slot', key: 'column-title' })
		expect(classifyAttr('v-slot:event')).toEqual({ kind: 'slot', key: 'event' })
		expect(classifyAttr('v-slot')).toEqual({ kind: 'slot', key: 'default' })
		expect(toKebab('hoverDelay')).toBe('hover-delay')
		expect(toPascal('base-media-player')).toBe('BaseMediaPlayer')
		expect(toPascal('BaseText')).toBe('BaseText')
	})

	it('слоты: <template #x>, v-slot на самом теге, содержимое по умолчанию', () => {
		const slotsFor = (src: string) => slotsOf(parseTemplate(src)[0])
		expect(slotsFor('<A><template #a>1</template><template v-slot:b>2</template></A>')).toMatchObject({
			slots: [{ name: 'a' }, { name: 'b' }],
			hasDefault: false,
		})
		expect(slotsFor('<A v-slot="p">x</A>').slots).toEqual([{ name: 'default', at: 3 }])
		expect(slotsFor('<A><template #default>1</template></A>').hasDefault).toBe(true)
		expect(slotsFor('<A><b>x</b><template #a>1</template></A>').hasDefault).toBe(true)
		expect(slotsFor('<A>текст</A>').hasDefault).toBe(true)
		expect(slotsFor('<A />').hasDefault).toBe(false)
		expect(slotsFor('<A><template v-if="x">y</template></A>').hasDefault).toBe(true)
	})
})

describe('splitSfc и lineAt', () => {
	it('блоки верхнего уровня и их содержимое', () => {
		const src =
			'<template>\n\t<div><template #a>x</template></div>\n</template>\n\n<script setup lang="ts">\nconst a = 1\n</script>\n<style scoped lang="scss">\na {}\n</style>\n'
		const blocks = splitSfc(src)
		expect(blocks.map((b: { type: string }) => b.type)).toEqual(['template', 'script', 'style'])
		expect(src.slice(blocks[0].start, blocks[0].end)).toBe('\n\t<div><template #a>x</template></div>\n')
		expect(src.slice(blocks[1].start, blocks[1].end)).toBe('\nconst a = 1\n')
		expect(blocks[2].attrs).toBe(' scoped lang="scss"')
	})

	it('шаблон в одну строку и незакрытые блоки', () => {
		const one = '<template><A /></template>\n<script>x</script>'
		expect(splitSfc(one).map((b: { type: string }) => b.type)).toEqual(['template', 'script'])
		expect(splitSfc('<template>без конца')).toEqual([])
		expect(splitSfc('<script>без конца')).toEqual([])
		expect(splitSfc('<template><A />\n</template>\n</template>').length).toBe(1)
	})

	it('lineAt считает строки с единицы', () => {
		expect(lineAt('a\nb\nc', 0)).toBe(1)
		expect(lineAt('a\nb\nc', 2)).toBe(2)
		expect(lineAt('a\nb\nc', 4)).toBe(3)
	})
})

describe('unifiedDiff', () => {
	it('одинаковые тексты — пусто', () => {
		expect(unifiedDiff('f', 'a\nb', 'a\nb')).toBe('')
	})

	it('замена, вставка и удаление с контекстом', () => {
		expect(unifiedDiff('f.ts', 'a\nb\nc\nd\ne', 'a\nb\nX\nd\ne')).toBe(
			['--- a/f.ts', '+++ b/f.ts', '@@ -1,5 +1,5 @@', ' a', ' b', '-c', '+X', ' d', ' e'].join('\n'),
		)
		expect(unifiedDiff('f', 'a', 'a\nb')).toContain('+b')
		expect(unifiedDiff('f', 'a\nb', 'a')).toContain('-b')
		expect(unifiedDiff('f', '', 'новое')).toContain('+новое')
		expect(unifiedDiff('f', 'старое', '')).toContain('-старое')
		expect(unifiedDiff('f', 'a\r\nb\r\n', 'a\r\nc\r\n')).toContain('-b\n+c')
	})

	it('далёкие правки — отдельные блоки, близкие — один', () => {
		const lines = Array.from({ length: 30 }, (_, i) => `line${i}`)
		const near = [...lines]
		near[10] = 'A'
		near[13] = 'B'
		expect(unifiedDiff('f', lines.join('\n'), near.join('\n')).match(/^@@/gm)).toHaveLength(1)
		const far = [...lines]
		far[2] = 'A'
		far[25] = 'B'
		const diff = unifiedDiff('f', lines.join('\n'), far.join('\n'))
		expect(diff.match(/^@@/gm)).toHaveLength(2)
		expect(diff).toContain('@@ -23,7 +23,7 @@')
	})

	it('остаток старого текста после общей части', () => {
		expect(unifiedDiff('f', 'y\nx', 'z\ny')).toBe(['--- a/f', '+++ b/f', '@@ -1,2 +1,2 @@', '+z', ' y', '-x'].join('\n'))
	})

	it('чередующиеся строки: LCS не теряет общие', () => {
		expect(unifiedDiff('f', 'a\nx\nb\ny\nc', 'a\nb\nz\nc')).toBe(
			['--- a/f', '+++ b/f', '@@ -1,5 +1,4 @@', ' a', '-x', ' b', '-y', '+z', ' c'].join('\n'),
		)
	})

	it('слишком большая середина — заменяется целиком', () => {
		const a = Array.from({ length: 2100 }, (_, i) => `a${i}`).join('\n')
		const b = Array.from({ length: 2100 }, (_, i) => `b${i}`).join('\n')
		const diff = unifiedDiff('f', a, b)
		expect(diff).toContain('-a0')
		expect(diff).toContain('+b2099')
	})
})
