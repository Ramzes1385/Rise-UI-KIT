import { parseMarkdown, withCaret } from '../model/markdownDocument'
import type { MarkdownBlock, MarkdownInline } from '../types/BaseMarkdown.types'

const inline = (source: string, hasLineBreaks = true): MarkdownInline[] => {
	const [block] = parseMarkdown(source, hasLineBreaks)
	return block?.type === 'paragraph' ? block.children : []
}

const text = (value: string): MarkdownInline => ({ type: 'text', value })

describe('parseMarkdown: строчные элементы', () => {
	it('выделение, зачёркивание, код и экранирование', () => {
		expect(inline('**жирный** *курсив* __ещё__ _и так_ ~~нет~~ `код`')).toEqual([
			{ type: 'strong', children: [text('жирный')] },
			text(' '),
			{ type: 'em', children: [text('курсив')] },
			text(' '),
			{ type: 'strong', children: [text('ещё')] },
			text(' '),
			{ type: 'em', children: [text('и так')] },
			text(' '),
			{ type: 'del', children: [text('нет')] },
			text(' '),
			{ type: 'code', value: 'код' },
		])
		expect(inline('\\*не курсив\\* и \\a')).toEqual([text('*не курсив* и \\a')])
		expect(inline('***оба***')).toEqual([{ type: 'strong', children: [{ type: 'em', children: [text('оба')] }] }])
	})

	it('незакрытые маркеры, snake_case и пробел после маркера остаются текстом', () => {
		expect(inline('**начало и snake_case_name * звезда')).toEqual([text('**начало и snake_case_name * звезда')])
		expect(inline('a * b * c')).toEqual([text('a * b * c')])
		expect(inline('`` код с ` внутри `` и ``` незакрытый')).toEqual([
			{ type: 'code', value: 'код с ` внутри' },
			text(' и ``` незакрытый'),
		])
		expect(inline('` a `')).toEqual([{ type: 'code', value: 'a' }])
	})

	it('ссылки: безопасные — ссылки, внешние — в новой вкладке, опасные — текст', () => {
		expect(inline('[сайт](https://example.com "Заголовок") [почта](mailto:a@b.ru) [внутри](/docs/a_(b))')).toEqual([
			{ type: 'link', href: 'https://example.com', isExternal: true, children: [text('сайт')] },
			text(' '),
			{ type: 'link', href: 'mailto:a@b.ru', isExternal: false, children: [text('почта')] },
			text(' '),
			{ type: 'link', href: '/docs/a_(b)', isExternal: false, children: [text('внутри')] },
		])
		expect(inline('[опасно](javascript:alert(1)) [**вложено** [x]](<https://a.ru/b c>)')).toEqual([
			text('опасно '),
			{
				type: 'link',
				href: 'https://a.ru/b c',
				isExternal: true,
				children: [{ type: 'strong', children: [text('вложено')] }, text(' [x]')],
			},
		])
		expect(inline('[без адреса] и [незакрытая](https://a.ru')).toEqual([
			text('[без адреса] и [незакрытая]('),
			{ type: 'link', href: 'https://a.ru', isExternal: true, children: [text('https://a.ru')] },
		])
		expect(inline('[скобка \\] внутри](/a\\)b) и [незакрытая')).toEqual([
			{ type: 'link', href: '/a\\)b', isExternal: false, children: [text('скобка ] внутри')] },
			text(' и [незакрытая'),
		])
		expect(inline('[пусто]()')).toEqual([text('пусто')])
	})

	it('адреса без разметки и в угловых скобках; знаки препинания в конце не входят в ссылку', () => {
		expect(inline('См. https://example.com/a?b=1. Или www.example.com, <https://x.ru/p>')).toEqual([
			text('См. '),
			{ type: 'link', href: 'https://example.com/a?b=1', isExternal: true, children: [text('https://example.com/a?b=1')] },
			text('. Или '),
			{ type: 'link', href: 'https://www.example.com', isExternal: true, children: [text('www.example.com')] },
			text(', '),
			{ type: 'link', href: 'https://x.ru/p', isExternal: true, children: [text('https://x.ru/p')] },
		])
		expect(inline('prehttps://example.com <x>')).toEqual([text('prehttps://example.com <x>')])
	})

	it('картинки: безопасные — картинка, опасные — подпись', () => {
		expect(inline('![кот](/cat.png) ![плохо](javascript:x) ![a]')).toEqual([
			{ type: 'image', src: '/cat.png', alt: 'кот' },
			text(' плохо ![a]'),
		])
	})

	it('картинки: data: только с типом image, иначе подпись (фаззинг XSS)', () => {
		expect(
			inline(
				'![ок](data:image/png;base64,AAAA) ![документ](data:text/html;base64,PHNjcmlwdD4=) ![скрипт](DaTa:application/javascript,x)',
			),
		).toEqual([{ type: 'image', src: 'data:image/png;base64,AAAA', alt: 'ок' }, text(' документ скрипт')])
	})

	it('перевод строки: перенос в режиме чата, иначе пробел; два пробела в конце — перенос всегда', () => {
		expect(inline('раз\nдва')).toEqual([text('раз'), { type: 'br' }, text('два')])
		expect(inline('раз\nдва', false)).toEqual([text('раз два')])
		expect(inline('раз  \nдва', false)).toEqual([text('раз'), { type: 'br' }, text('два')])
	})
})

describe('parseMarkdown: блоки', () => {
	it('заголовки ATX и Setext, линии, абзацы', () => {
		const blocks = parseMarkdown('# Один #\n###### Шесть\n#\nАбзац\nстрока\n\nЗаголовок\n===\nВторой\n---\n\n***\n- - -')
		expect(blocks.map(block => block.type)).toEqual(['heading', 'heading', 'heading', 'paragraph', 'heading', 'heading', 'hr', 'hr'])
		expect(blocks[0]).toEqual({ type: 'heading', level: 1, children: [text('Один')] })
		expect(blocks[1]).toMatchObject({ level: 6 })
		expect(blocks[2]).toEqual({ type: 'heading', level: 1, children: [] })
		expect(blocks[4]).toMatchObject({ level: 1, children: [text('Заголовок')] })
		expect(blocks[5]).toMatchObject({ level: 2, children: [text('Второй')] })
	})

	it('блоки кода: язык, отступ, закрытие длинной оградой, незакрытый — до конца', () => {
		expect(parseMarkdown('  ```ts\n  const a = 1\n    b\n  ```\n~~~\nx\n~~~~')).toEqual([
			{ type: 'code', lang: 'ts', value: 'const a = 1\n  b', hasCaret: false },
			{ type: 'code', lang: '', value: 'x', hasCaret: false },
		])
		expect(parseMarkdown('Текст\n```py\nprint(1)\n``')).toEqual([
			{ type: 'paragraph', children: [text('Текст')] },
			{ type: 'code', lang: 'py', value: 'print(1)\n``', hasCaret: false },
		])
	})

	it('цитаты с вложенными блоками', () => {
		expect(parseMarkdown('> Цитата\n> - пункт\n>\n>> глубже')).toEqual([
			{
				type: 'blockquote',
				children: [
					{ type: 'paragraph', children: [text('Цитата')] },
					{ type: 'list', ordered: false, start: 1, items: [{ checked: null, inline: [text('пункт')], children: [] }] },
					{ type: 'blockquote', children: [{ type: 'paragraph', children: [text('глубже')] }] },
				],
			},
		])
	})

	it('списки: маркированный, нумерованный с началом, вложенные, задачи, пункты из нескольких блоков', () => {
		const [bullets, numbers] = parseMarkdown(
			'- [x] готово\n- [ ] план\n  продолжение\n- пункт\n\n  второй абзац\n\n  - вложенный\n\n3) три\n4) четыре\n\n+',
		)
		expect(bullets).toMatchObject({ type: 'list', ordered: false })
		const items = (bullets as Extract<MarkdownBlock, { type: 'list' }>).items
		expect(items.map(item => item.checked)).toEqual([true, false, null])
		expect(items[1].inline).toEqual([text('план'), { type: 'br' }, text('продолжение')])
		expect(items[2].inline).toBeNull()
		expect(items[2].children.map(block => block.type)).toEqual(['paragraph', 'paragraph', 'list'])
		expect(numbers).toMatchObject({ type: 'list', ordered: true, start: 3 })
		expect(parseMarkdown('+')).toEqual([
			{ type: 'list', ordered: false, start: 1, items: [{ checked: null, inline: null, children: [] }] },
		])
		expect(parseMarkdown('1.     код')).toMatchObject([{ items: [{ inline: [text('код')] }] }])
	})

	it('абзац прерывают список с первого пункта, заголовок и цитата, но не список с номера 2', () => {
		expect(parseMarkdown('Абзац\n2. не список\n- список').map(block => block.type)).toEqual(['paragraph', 'list'])
		expect(parseMarkdown('Абзац\n> цитата\n# Заголовок').map(block => block.type)).toEqual(['paragraph', 'blockquote', 'heading'])
	})

	it('таблицы: выравнивание, экранированная черта, недостающие ячейки; без строки-разделителя — абзац', () => {
		expect(parseMarkdown('| A | B | C | D |\n|:--|:-:|--:|---|\n| 1 | a \\| b |\n| x | y | z | w | лишняя |\n\nпосле')).toEqual([
			{
				type: 'table',
				align: ['left', 'center', 'right', null],
				head: [[text('A')], [text('B')], [text('C')], [text('D')]],
				rows: [
					[[text('1')], [text('a | b')], [], []],
					[[text('x')], [text('y')], [text('z')], [text('w')]],
				],
			},
			{ type: 'paragraph', children: [text('после')] },
		])
		expect(parseMarkdown('a | b\n--- | ---\n1 | 2')).toMatchObject([{ type: 'table', rows: [[[text('1')], [text('2')]]] }])
		expect(parseMarkdown('| A | B |\n| --- |').map(block => block.type)).toEqual(['paragraph'])
		expect(parseMarkdown('| A |\nтекст').map(block => block.type)).toEqual(['paragraph'])
	})

	it('HTML — это текст; переводы строк Windows и табуляция', () => {
		expect(parseMarkdown('<b>жирный</b>\r\n\r\n\tкод?')).toEqual([
			{ type: 'paragraph', children: [text('<b>жирный</b>')] },
			{ type: 'paragraph', children: [text('код?')] },
		])
		expect(parseMarkdown('')).toEqual([])
	})
})

function elapsed(run: () => void): number {
	const started = performance.now()
	run()
	return performance.now() - started
}

function blockDepth(blocks: readonly MarkdownBlock[]): number {
	return Math.max(0, ...blocks.map(block => (block.type === 'blockquote' ? 1 + blockDepth(block.children) : 0)))
}

function inlineDepth(nodes: readonly MarkdownInline[]): number {
	return Math.max(0, ...nodes.map(node => ('children' in node ? 1 + inlineDepth(node.children) : 0)))
}

describe('parseMarkdown: патологические входы (фаззинг XSS)', () => {
	const LIMIT_MS = 2000

	it.each([
		['непарные **', '**a '.repeat(8000)],
		['непарные *', '*a '.repeat(10_000)],
		['непарные _', '_a '.repeat(10_000)],
		['непарные ~~', '~~a '.repeat(8000)],
		['открытые ссылки [a](', '[a]('.repeat(8000)],
		['открытые картинки ![a](', '![a]('.repeat(6000)],
		['открытые скобки [', '['.repeat(30_000)],
		['вложенные подписи ссылок', `${'[a '.repeat(5000)}${']('.repeat(5000)}`],
		['список из пунктов', '- a\n'.repeat(8000)],
		['один пункт из строк', `- a\n${'  b\n'.repeat(8000)}`],
	])('%s: разбор за линейное время, а не за секунды', (_name, source) => {
		expect(elapsed(() => parseMarkdown(source))).toBeLessThan(LIMIT_MS)
	})

	it('цитаты и списки глубже 32 уровней — текст: рекурсия не упирается в стек', () => {
		const blocks = parseMarkdown('> '.repeat(5000))
		expect(blockDepth(blocks)).toBeLessThanOrEqual(33)
		expect(() => parseMarkdown('- '.repeat(5000))).not.toThrow()
		expect(() => parseMarkdown('> - '.repeat(5000))).not.toThrow()
	})

	it('выделения и подписи ссылок глубже 32 уровней — текст', () => {
		expect(inlineDepth(inline(`${'*'.repeat(5000)}a${'*'.repeat(5000)}`))).toBeLessThanOrEqual(33)
		expect(inlineDepth(inline(`${'['.repeat(5000)}a${'](https://a.ru)'.repeat(5000)}`))).toBeLessThanOrEqual(33)
	})

	it('ответ прежний: пары скобок и выделения вне патологии разбираются как раньше', () => {
		expect(inline('[a [b](x) c](https://a.ru/(1)) [d]( ](e)')).toEqual([
			{
				type: 'link',
				href: 'https://a.ru/(1)',
				isExternal: true,
				children: [text('a '), { type: 'link', href: 'x', isExternal: false, children: [text('b')] }, text(' c')],
			},
			text(' [d]( ](e)'),
		])
		expect(inline('**a *b* c** *d')).toEqual([
			{ type: 'strong', children: [text('a '), { type: 'em', children: [text('b')] }, text(' c')] },
			text(' *d'),
		])
	})
})

describe('withCaret', () => {
	const caret: MarkdownInline = { type: 'caret' }

	it('курсор — в конце последнего абзаца, заголовка, кода, цитаты или пункта', () => {
		expect(withCaret(parseMarkdown('Текст'))).toEqual([{ type: 'paragraph', children: [text('Текст'), caret] }])
		expect(withCaret(parseMarkdown('# Итоги'))).toEqual([{ type: 'heading', level: 1, children: [text('Итоги'), caret] }])
		expect(withCaret(parseMarkdown('```\nx'))).toEqual([{ type: 'code', lang: '', value: 'x', hasCaret: true }])
		expect(withCaret(parseMarkdown('> a'))).toEqual([
			{ type: 'blockquote', children: [{ type: 'paragraph', children: [text('a'), caret] }] },
		])
		expect(withCaret(parseMarkdown('- a\n- b'))).toMatchObject([{ items: [{ inline: [text('a')] }, { inline: [text('b'), caret] }] }])
		expect(withCaret(parseMarkdown('- a\n\n  b'))).toMatchObject([
			{ items: [{ children: [{ children: [text('a')] }, { children: [text('b'), caret] }] }] },
		])
	})

	it('после линии и таблицы, а также в пустом ответе — отдельный абзац с курсором', () => {
		expect(withCaret(parseMarkdown('---'))).toEqual([{ type: 'hr' }, { type: 'paragraph', children: [caret] }])
		expect(withCaret([])).toEqual([{ type: 'paragraph', children: [caret] }])
	})
})
