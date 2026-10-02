import {
	CODE_LANGUAGE_NAMES,
	CODE_LANGUAGES,
	getCodeLanguageName,
	highlightCode,
	normalizeCodeLanguage,
	splitCodeLines,
	tokenizeCode,
} from '..'

function typed(code: string, language: string): string[] {
	return tokenizeCode(code, language)
		.filter(token => token.type)
		.map(token => `${token.type}:${token.value}`)
}

function joined(code: string, language: string): string {
	return tokenizeCode(code, language)
		.map(token => token.value)
		.join('')
}

describe('codeHighlightUtils: языки', () => {
	it('находит язык по имени и псевдониму без учёта регистра и пробелов', () => {
		expect(normalizeCodeLanguage('TS')).toBe('typescript')
		expect(normalizeCodeLanguage(' js ')).toBe('javascript')
		expect(normalizeCodeLanguage('sh')).toBe('bash')
		expect(normalizeCodeLanguage('py')).toBe('python')
		expect(normalizeCodeLanguage('svg')).toBe('html')
		expect(normalizeCodeLanguage('jsonc')).toBe('json')
	})

	it('возвращает null для неизвестного, пустого языка и ключей прототипа', () => {
		expect(normalizeCodeLanguage('cobol')).toBeNull()
		expect(normalizeCodeLanguage('')).toBeNull()
		expect(normalizeCodeLanguage(null)).toBeNull()
		expect(normalizeCodeLanguage(undefined)).toBeNull()
		expect(normalizeCodeLanguage('constructor')).toBeNull()
	})

	it('у каждого языка есть название', () => {
		for (const language of CODE_LANGUAGES) expect(CODE_LANGUAGE_NAMES[language]).toBeTruthy()
	})

	it('название: известное — по таблице, неизвестное — как передано, пустое — пустая строка', () => {
		expect(getCodeLanguageName('ts')).toBe('TypeScript')
		expect(getCodeLanguageName(' Rust ')).toBe('Rust')
		expect(getCodeLanguageName(undefined)).toBe('')
	})
})

describe('codeHighlightUtils: фрагменты и строки', () => {
	it('пустой код — без фрагментов и одна пустая строка', () => {
		expect(tokenizeCode('', 'ts')).toEqual([])
		expect(highlightCode('', 'ts')).toEqual([[]])
	})

	it('неизвестный язык — один фрагмент простого текста, разметка не разбирается', () => {
		expect(tokenizeCode('<b>x</b>', 'text')).toEqual([{ type: null, value: '<b>x</b>' }])
	})

	it('склеенный текст фрагментов равен исходному коду на всех языках', () => {
		const code = 'a = "x" // y\n<div>{{ b }}</div>\n$c: 1px; # z'
		for (const language of CODE_LANGUAGES) expect(joined(code, language)).toBe(code)
	})

	it('режет фрагмент через перевод строки и сохраняет пустые строки', () => {
		const lines = splitCodeLines([
			{ type: 'comment', value: '/* a\nb */' },
			{ type: null, value: '\n\n' },
			{ type: 'number', value: '1' },
		])
		expect(lines).toEqual([
			[{ type: 'comment', value: '/* a' }],
			[{ type: 'comment', value: 'b */' }],
			[],
			[{ type: 'number', value: '1' }],
		])
	})

	it('highlightCode делит подсветку по строкам', () => {
		expect(highlightCode('let a\nlet b', 'js').map(line => line[0])).toEqual([
			{ type: 'keyword', value: 'let' },
			{ type: 'keyword', value: 'let' },
		])
	})
})

describe('codeHighlightUtils: JavaScript и TypeScript', () => {
	it('ключевые слова, строки, комментарии, числа и константы', () => {
		expect(typed("const a = 'x' // c\n/* b */ let n = 0x1F + 1.5e3 + .5 + 10n + true", 'js')).toEqual([
			'keyword:const',
			"string:'x'",
			'comment:// c',
			'comment:/* b */',
			'keyword:let',
			'number:0x1F',
			'number:1.5e3',
			'number:.5',
			'number:10n',
			'number:true',
		])
	})

	it('шаблонные строки, незакрытые строки и комментарии до конца', () => {
		expect(typed('`a ${b}`', 'js')).toEqual(['string:`a ${b}`'])
		expect(typed('"abc', 'js')).toEqual(['string:"abc'])
		expect(typed('/* open', 'js')).toEqual(['comment:/* open'])
	})

	it('вызов — function, после точки — property или function, декоратор — function', () => {
		expect(typed('@Component\nfoo(1); obj.value; obj.run ()', 'ts')).toEqual([
			'function:@Component',
			'function:foo',
			'number:1',
			'property:value',
			'function:run',
		])
	})

	it('ключевые слова TypeScript — только в TypeScript', () => {
		expect(typed('type A = string', 'ts')).toEqual(['keyword:type', 'keyword:string'])
		expect(typed('type A = string', 'js')).toEqual([])
	})

	it('цифра сразу после имени или числа не выделяется отдельно', () => {
		expect(typed('a1 1n2', 'js')).toEqual(['number:1n'])
	})
})

describe('codeHighlightUtils: JSON', () => {
	it('ключи — property, строки — string, числа, true, false, null и комментарии', () => {
		expect(typed('{"a": "b", "n": -1.5e2, "t": [true, false, null]} // c', 'json')).toEqual([
			'property:"a"',
			'string:"b"',
			'property:"n"',
			'number:-1.5e2',
			'property:"t"',
			'keyword:true',
			'keyword:false',
			'keyword:null',
			'comment:// c',
		])
	})
})

describe('codeHighlightUtils: CSS и SCSS', () => {
	it('селекторы, псевдоклассы, свойства, значения, функции, переменные и @-правила', () => {
		const css =
			'@media (max-width: 600px) {\n  .a > b:hover, #id::before { color: #fff !important; width: calc(100% - 2px); --x: 1em }\n}'
		expect(typed(css, 'css')).toEqual([
			'keyword:@media',
			'property:max-width',
			'number:600px',
			'attribute:.a',
			'tag:b',
			'keyword::hover',
			'attribute:#id',
			'keyword:::before',
			'property:color',
			'number:#fff',
			'keyword:!important',
			'property:width',
			'function:calc',
			'number:100%',
			'number:2px',
			'variable:--x',
			'number:1em',
		])
	})

	it('строки, комментарии и слова без вида; число сразу после слова не выделяется', () => {
		expect(typed('a { content: "x"; border: solid 1px2 } /* c */', 'css')).toEqual([
			'tag:a',
			'property:content',
			'string:"x"',
			'property:border',
			'number:1px',
			'comment:/* c */',
		])
	})

	it('SCSS: строчные комментарии и переменные $; в CSS // — не комментарий', () => {
		expect(typed('$c: red; // note', 'scss')).toEqual(['variable:$c', 'comment:// note'])
		expect(typed('// note', 'css')).toEqual([])
	})
})

describe('codeHighlightUtils: Bash', () => {
	it('команды, ключи, строки, переменные, комментарии и ключевые слова', () => {
		const bash = '#!/bin/bash\nexport NAME="world" # tail\nif [ -f "$F" ]; then echo ${NAME} | grep -v --color 42; fi'
		expect(typed(bash, 'bash')).toEqual([
			'comment:#!/bin/bash',
			'keyword:export',
			'string:"world"',
			'comment:# tail',
			'keyword:if',
			'attribute:-f',
			'string:"$F"',
			'keyword:then',
			'function:echo',
			'variable:${NAME}',
			'function:grep',
			'attribute:-v',
			'attribute:--color',
			'number:42',
			'keyword:fi',
		])
	})

	it('приглашение $ в начале строки, присваивание, одинарные кавычки и $ в середине строки', () => {
		expect(typed("$ npm run build\nFOO=1 make 'x'\necho $ cat", 'sh')).toEqual([
			'function:npm',
			'variable:FOO',
			'number:1',
			"string:'x'",
			'function:echo',
		])
	})

	it('# и - внутри слова, цифры с буквами — не выделяются', () => {
		expect(typed('echo a#b "x"-v 12a', 'bash')).toEqual(['function:echo', 'string:"x"'])
	})
})

describe('codeHighlightUtils: Python', () => {
	it('декораторы, определения, вызовы, строки с префиксами, числа, self и константы', () => {
		const python =
			'@decorator\ndef greet(name):\n    """Doc"""\n    print(f"hi {name}", 0x1F, 3.14j)\n    self.value = True\n    x.run()\nclass Foo: pass'
		expect(typed(python, 'python')).toEqual([
			'function:@decorator',
			'keyword:def',
			'function:greet',
			'string:"""Doc"""',
			'function:print',
			'string:f"hi {name}"',
			'number:0x1F',
			'number:3.14j',
			'variable:self',
			'property:value',
			'number:True',
			'function:run',
			'keyword:class',
			'function:Foo',
			'keyword:pass',
		])
	})

	it('комментарии; @ не в начале строки и цифра после числа не выделяются', () => {
		expect(typed("a @b # c\n1j2 r'x'", 'py')).toEqual(['comment:# c', 'number:1j', "string:r'x'"])
	})
})

describe('codeHighlightUtils: HTML', () => {
	it('теги, атрибуты, значения, комментарии и DOCTYPE', () => {
		expect(typed('<!DOCTYPE html>\n<!-- c --><p id=x class="a" hidden>a < b</p>', 'html')).toEqual([
			'keyword:DOCTYPE',
			'attribute:html',
			'comment:<!-- c -->',
			'tag:p',
			'attribute:id',
			'string:x',
			'attribute:class',
			'string:"a"',
			'attribute:hidden',
			'tag:p',
		])
	})

	it('script — JavaScript, TypeScript по lang, JSON по type; style — CSS или SCSS', () => {
		expect(typed('<script>let a = "</p>"</script>', 'html')).toEqual(['tag:script', 'keyword:let', 'string:"</p>"', 'tag:script'])
		expect(typed('<script lang="tsx">type A</script>', 'html')).toContain('keyword:type')
		expect(typed('<script type="application/ld+json">{"a": 1}</script>', 'html')).toContain('property:"a"')
		expect(typed('<style>a { color: red }</style>', 'html')).toContain('property:color')
		expect(typed('<style lang="scss">$c: 1;</style>', 'html')).toContain('variable:$c')
	})

	it('самозакрытый script не разбирает содержимое; выражения {{ }} в HTML — текст', () => {
		expect(typed('<script src="a.js" />let x', 'html')).toEqual(['tag:script', 'attribute:src', 'string:"a.js"'])
		expect(typed('<b>{{ let }}</b>', 'html')).toEqual(['tag:b', 'tag:b'])
	})

	it('незакрытые комментарий, тег, значение и пустые конструкции не ломают разбор', () => {
		expect(typed('<!-- open', 'html')).toEqual(['comment:<!-- open'])
		expect(typed('<div class="a', 'html')).toEqual(['tag:div', 'attribute:class', 'string:"a'])
		expect(typed('<a b=>', 'html')).toEqual(['tag:a', 'attribute:b'])
		expect(typed('<a "x">', 'html')).toEqual(['tag:a'])
		expect(typed('</>', 'html')).toEqual([])
		expect(joined('a <', 'html')).toBe('a <')
		expect(typed('<script>let', 'html')).toEqual(['tag:script', 'keyword:let'])
	})
})

describe('codeHighlightUtils: Vue', () => {
	it('выражения {{ }}, директивы и обычные атрибуты', () => {
		expect(typed('<div class="a" :title="msg + 1" @click="go()" v-if="ok">{{ count * 2 }}</div>', 'vue')).toEqual([
			'tag:div',
			'attribute:class',
			'string:"a"',
			'attribute::title',
			'number:1',
			'attribute:@click',
			'function:go',
			'attribute:v-if',
			'number:2',
			'tag:div',
		])
	})

	it('незакрытые выражение и значение директивы', () => {
		expect(typed('{{ a(', 'vue')).toEqual(['function:a'])
		expect(joined('<a :b="', 'vue')).toBe('<a :b="')
		expect(typed('<a :b="1', 'vue')).toEqual(['tag:a', 'attribute::b', 'number:1'])
	})

	it('однофайловый компонент: шаблон, script setup lang="ts", style lang="scss"', () => {
		const sfc =
			'<template><p>{{ a }}</p></template>\n<script setup lang="ts">\nconst a: string = \'x\'\n</script>\n<style lang="scss">\n$c: red;\n</style>'
		const result = typed(sfc, 'vue')
		expect(result).toEqual(expect.arrayContaining(['keyword:const', 'keyword:string', "string:'x'", 'variable:$c']))
	})
})
