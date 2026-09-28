import { escapeHtml, sanitizeHtml } from '../htmlUtils'

describe('htmlUtils.escapeHtml', () => {
	it('экранирует символы разметки и кавычки', () => {
		expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;')
	})

	it('не меняет обычный текст', () => {
		expect(escapeHtml('Привет, мир')).toBe('Привет, мир')
	})
})

describe('htmlUtils.sanitizeHtml', () => {
	describe('безопасная разметка редактора', () => {
		it.each([
			'<p>Текст с <b>жирным</b>, <i>курсивом</i>, <u>подчёркиванием</u> и <strike>зачёркиванием</strike></p>',
			'<h2 style="text-align: center;">Заголовок</h2><blockquote>Цитата</blockquote><pre><code>const a = 1</code></pre>',
			'<ul><li>Один</li><li>Два</li></ul><ol start="3"><li value="3">Три</li></ol>',
			'<p><font color="#dc2626">красный</font> и <span style="background-color: rgb(254, 240, 138);">маркер</span></p>',
			'<p><a href="https://example.com/page">ссылка</a> и <a href="/docs#install">относительная</a></p>',
			'<img src="blob:https://example.com/0f6e" alt="" style="width: 320px; height: 180px;"><hr><br>',
			'<video src="blob:https://example.com/9a1c" controls="" style="max-width:100%;border-radius:8px;"></video>',
			'<p>Смайл <img src="data:image/png;base64,iVBORw0KGgo=" alt="smile"></p>',
		])('возвращает %s без изменений', html => {
			expect(sanitizeHtml(html)).toBe(html)
		})

		it('идемпотентна: повторная очистка ничего не меняет', () => {
			const once = sanitizeHtml('<p onclick="x()">a<script>b</script><span style="color: red; position: fixed">c</span></p>')
			expect(sanitizeHtml(once)).toBe(once)
		})
	})

	describe('опасные элементы', () => {
		it.each([
			['<p>до<script>alert(1)</script>после</p>', '<p>допосле</p>'],
			['<style>body{display:none}</style><p>текст</p>', '<p>текст</p>'],
			['<iframe srcdoc="<script>alert(1)</script>"></iframe>ок', 'ок'],
			['<svg onload="alert(1)"><circle r="5"></circle></svg>ок', 'ок'],
			['<math><mi>x</mi></math>ок', 'ок'],
			['<object data="evil.swf"></object><embed src="evil.swf">ок', 'ок'],
			['<form action="https://evil.example"><input name="password"><button>Войти</button></form>ок', 'ок'],
			['<p>до</p><noscript><p title="</noscript><img src=x onerror=alert(1)>"></p></noscript>ок', '<p>до</p>ок'],
			['<template><img src=x onerror=alert(1)></template>ок', 'ок'],
			['<textarea><img src=x onerror=alert(1)></textarea>ок', 'ок'],
			['<meta http-equiv="refresh" content="0;url=https://evil.example"><link rel="stylesheet" href="x.css">ок', 'ок'],
		])('удаляет %s вместе с содержимым', (html, expected) => {
			expect(sanitizeHtml(html)).toBe(expected)
		})

		it('удаляет комментарии', () => {
			expect(sanitizeHtml('<!--StartFragment--><p>текст</p><!--EndFragment-->')).toBe('<p>текст</p>')
		})

		it('разворачивает неразрешённые элементы, сохраняя очищенное содержимое', () => {
			expect(sanitizeHtml('<section><article><b onclick="x()">жирный</b> текст</article></section>')).toBe('<b>жирный</b> текст')
		})

		it('разворачивает таблицы в текст', () => {
			expect(sanitizeHtml('<table><tbody><tr><td>ячейка</td></tr></tbody></table>')).toBe('ячейка')
		})
	})

	describe('известные XSS-векторы', () => {
		/** Разбирает результат в неактивном шаблоне и ищет то, что могло бы исполнить код. */
		function findExecutable(html: string): string[] {
			const template = document.createElement('template')
			template.innerHTML = html
			return [...template.content.querySelectorAll('*')].flatMap(element => {
				const tag = element.tagName.toLowerCase()
				const issues = ['script', 'iframe', 'object', 'embed', 'svg', 'math', 'style', 'noscript', 'form'].includes(tag) ? [tag] : []
				for (const attribute of element.attributes) {
					if (attribute.name.startsWith('on')) issues.push(`${tag}[${attribute.name}]`)
					if (/^\s*(javascript|vbscript|data:text)/i.test(attribute.value)) issues.push(`${tag}[${attribute.name}=${attribute.value}]`)
				}
				return issues
			})
		}

		it.each([
			'<img src=x onerror=alert(1)>',
			'<svg><script>alert(1)</script></svg>',
			'<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>',
			'<form><math><mtext></form><form><mglyph><style></math><img src onerror=alert(1)>',
			'<noscript><p title="</noscript><img src=x onerror=alert(1)>">',
			'<a href="javas&#99;ript:alert(1)">x</a>',
			'<a href="&#x6A;avascript:alert(1)">x</a>',
			'<iframe src="javascript:alert(1)"></iframe>',
			'<details open ontoggle=alert(1)>x</details>',
			'<body onload=alert(1)>x',
			'<video><source onerror=alert(1)></video>',
			'<div style="background:url(javascript:alert(1))">x</div>',
			'<a href="https://example.com" onclick="alert(1)">x</a>',
			'<img srcset="javascript:alert(1)">',
			'<input onfocus=alert(1) autofocus>',
			'<marquee onstart=alert(1)>x</marquee>',
			'<object data="javascript:alert(1)"></object>',
			'<svg><a xlink:href="javascript:alert(1)"><text>x</text></a></svg>',
		])('обезвреживает %s', payload => {
			expect(findExecutable(sanitizeHtml(payload))).toEqual([])
		})
	})

	describe('атрибуты', () => {
		it('удаляет обработчики событий, class, id и data-атрибуты', () => {
			expect(sanitizeHtml('<p onclick="alert(1)" onmouseover="x()" class="evil" id="login" data-x="1">текст</p>')).toBe('<p>текст</p>')
		})

		it('удаляет обработчик у разрешённого изображения', () => {
			expect(sanitizeHtml('<img src="https://example.com/a.png" onerror="alert(1)" alt="фото">')).toBe('<img src="https://example.com/a.png" alt="фото">')
		})

		it.each([
			'javascript:alert(1)',
			'JaVaScRiPt:alert(1)',
			' java\tscript:alert(1)',
			'vbscript:msgbox(1)',
			'data:text/html,<script>alert(1)</script>',
		])('удаляет href %j', href => {
			const link = document.createElement('a')
			link.setAttribute('href', href)
			link.textContent = 'ссылка'
			expect(sanitizeHtml(link.outerHTML)).toBe('<a>ссылка</a>')
		})

		it('разрешает mailto: и tel: в ссылках', () => {
			const html = '<a href="mailto:team@example.com">почта</a> <a href="tel:+79990000000">телефон</a>'
			expect(sanitizeHtml(html)).toBe(html)
		})

		it.each([
			['<img src="data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C%2Fsvg%3E" alt="">', '<img src="data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C%2Fsvg%3E" alt="">'],
			['<img src="data:text/html;base64,PHNjcmlwdD4=" alt="">', '<img alt="">'],
			['<img src="javascript:alert(1)" alt="">', '<img alt="">'],
			['<video src="data:video/mp4;base64,AAAA" controls=""></video>', '<video controls=""></video>'],
			['<video src="https://example.com/v.mp4" poster="javascript:alert(1)"></video>', '<video src="https://example.com/v.mp4"></video>'],
		])('проверяет адреса медиа: %s', (html, expected) => {
			expect(sanitizeHtml(html)).toBe(expected)
		})

		it('добавляет rel="noopener noreferrer" ссылке в новой вкладке', () => {
			expect(sanitizeHtml('<a href="https://example.com" target="_blank" rel="opener">сайт</a>')).toBe('<a href="https://example.com" target="_blank" rel="noopener noreferrer">сайт</a>')
		})

		it('удаляет неизвестное значение target', () => {
			expect(sanitizeHtml('<a href="/a" target="evil-frame">a</a>')).toBe('<a href="/a">a</a>')
		})

		it.each([
			['<p align="center">a</p>', '<p align="center">a</p>'],
			['<p align="expression(alert(1))">a</p>', '<p>a</p>'],
			['<font color="red" size="4">a</font>', '<font color="red" size="4">a</font>'],
			['<font color="url(javascript:alert(1))">a</font>', '<font>a</font>'],
		])('проверяет значение align и color: %s', (html, expected) => {
			expect(sanitizeHtml(html)).toBe(expected)
		})
	})

	describe('стили', () => {
		it('оставляет только разрешённые свойства', () => {
			expect(sanitizeHtml('<span style="color: red; position: fixed; top: 0">a</span>')).toBe('<span style="color: red">a</span>')
		})

		it.each([
			'background-color: url(https://evil.example/track.png)',
			'width: expression(alert(1))',
			'color: \\72 ed',
			'color: red !important',
			'broken',
		])('удаляет небезопасное объявление %j', style => {
			const span = document.createElement('span')
			span.setAttribute('style', style)
			span.textContent = 'a'
			expect(sanitizeHtml(span.outerHTML)).toBe('<span>a</span>')
		})
	})

	describe('граничные случаи', () => {
		it('возвращает пустую строку для пустого ввода', () => {
			expect(sanitizeHtml('')).toBe('')
		})

		it('оставляет обычный текст', () => {
			expect(sanitizeHtml('просто текст')).toBe('просто текст')
		})

		it('без DOMParser (SSR) возвращает экранированный текст', () => {
			vi.stubGlobal('DOMParser', undefined)
			try {
				expect(sanitizeHtml('<b>жирный</b>')).toBe('&lt;b&gt;жирный&lt;/b&gt;')
			} finally {
				vi.unstubAllGlobals()
			}
		})
	})
})
