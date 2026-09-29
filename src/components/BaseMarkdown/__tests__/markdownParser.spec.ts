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
