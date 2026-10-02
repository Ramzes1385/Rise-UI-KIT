import { sanitizeSvg } from '../../model/svg/sanitizeSvg'

const PREFIX = 'rise-im-t-'
const XLINK = 'http://www.w3.org/1999/xlink'
const wrap = (body: string, attributes = ''): string =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" ${attributes}>${body}</svg>`

function parse(markup: string): Element {
	return new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
}

describe('sanitizeSvg', () => {
	it('возвращает пустую строку для не-SVG и невалидной разметки', () => {
		expect(sanitizeSvg('<div>x</div>', PREFIX)).toBe('')
		expect(sanitizeSvg('<svg><rect></svg>', PREFIX)).toBe('')
	})

	it('растягивает корень на 100% и сохраняет viewBox', () => {
		const root = parse(sanitizeSvg(wrap('<rect width="5" height="5"/>', 'width="10" height="10"'), PREFIX))
		expect(root.getAttribute('width')).toBe('100%')
		expect(root.getAttribute('height')).toBe('100%')
		expect(root.getAttribute('viewBox')).toBe('0 0 10 10')
	})

	it('удаляет запрещённые теги вместе с содержимым', () => {
		const result = sanitizeSvg(
			wrap('<script>alert(1)</script><foreignObject><div/></foreignObject><style>*{}</style><g><rect/><a href="#x"><rect/></a></g>'),
			PREFIX,
		)
		expect(result).not.toMatch(/script|foreignObject|style>|<a /)
		expect(parse(result).querySelectorAll('rect')).toHaveLength(1)
	})

	it('удаляет обработчики, неизвестные и опасные атрибуты', () => {
		const root = parse(
			sanitizeSvg(
				wrap(
					'<rect onclick="x()" onload="y()" foo="1" fill="url(https://evil/x.svg)" stroke="javascript:x" style="background:url(a.png)" class="room" data-kind="shop" data-bad="url(x)" opacity="0.5"/>',
					'onload="z()"',
				),
				PREFIX,
			),
		)
		const rect = root.querySelector('rect') as Element
		expect(root.hasAttribute('onload')).toBe(false)
		expect([...rect.attributes].map(attribute => attribute.name).sort()).toEqual(['class', 'opacity'])
	})

	it('отсекает @import, expression и обратный слэш в значениях', () => {
		const rect = parse(
			sanitizeSvg(wrap('<rect style="@import x" class="expression(a)" fill="\\61"/><circle style="fill: red"/>'), PREFIX),
		)
		expect([...(rect.querySelector('rect') as Element).attributes]).toHaveLength(0)
		expect(rect.querySelector('circle')?.getAttribute('style')).toBe('fill: red')
	})

	it('href у use — только #id, у image — только data:image base64', () => {
		const root = parse(
			sanitizeSvg(
				wrap(
					'<use id="u1" href="#shape"/><use id="u2" href="https://evil/x#a"/><image id="i1" href="data:image/png;base64,AAAA"/><image id="i2" href="https://evil/x.png"/><image id="i3" href="data:image/svg+xml;base64,AAAA"/>',
				),
				PREFIX,
			),
		)
		expect(root.querySelector(`[id="${PREFIX}u1"]`)?.getAttribute('href')).toBe(`#${PREFIX}shape`)
		expect(root.querySelector(`[id="${PREFIX}u2"]`)?.hasAttribute('href')).toBe(false)
		expect(root.querySelector(`[id="${PREFIX}i1"]`)?.getAttribute('href')).toBe('data:image/png;base64,AAAA')
		expect(root.querySelector(`[id="${PREFIX}i2"]`)?.hasAttribute('href')).toBe(false)
		expect(root.querySelector(`[id="${PREFIX}i3"]`)?.hasAttribute('href')).toBe(false)
	})

	it('добавляет префикс к id и переписывает ссылки #id и url(#id), цвета #rrggbb не трогает', () => {
		const root = parse(
			sanitizeSvg(
				wrap(
					'<defs><linearGradient id="grad"><stop offset="0" stop-color="#fff"/></linearGradient></defs><rect id="room" fill="url(#grad)" stroke="#94a3b8" clip-path="url(\'#clip\')"/>',
					'id="plan"',
				),
				PREFIX,
			),
		)
		expect(root.getAttribute('id')).toBe(`${PREFIX}plan`)
		expect(root.querySelector('linearGradient')?.getAttribute('id')).toBe(`${PREFIX}grad`)
		const rect = root.querySelector('rect') as Element
		expect(rect.getAttribute('id')).toBe(`${PREFIX}room`)
		expect(rect.getAttribute('fill')).toBe(`url(#${PREFIX}grad)`)
		expect(rect.getAttribute('clip-path')).toBe(`url('#${PREFIX}clip')`)
		expect(rect.getAttribute('stroke')).toBe('#94a3b8')
		expect(root.querySelector('stop')?.getAttribute('stop-color')).toBe('#fff')
	})

	it('xlink:href переезжает в href с префиксом, xlink:href не остаётся', () => {
		const result = sanitizeSvg(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="#a"/></svg>',
			PREFIX,
		)
		const use = parse(result).querySelector('use') as Element
		expect(use.getAttribute('href')).toBe(`#${PREFIX}a`)
		expect(use.hasAttributeNS(XLINK, 'href')).toBe(false)
		expect(result).not.toContain('xlink')
	})

	it('небезопасный xlink:href не переезжает, существующий href не перезаписывается', () => {
		const root = parse(
			sanitizeSvg(
				`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="${XLINK}"><use id="u1" xlink:href="javascript:alert(1)"/><use id="u2" href="#b" xlink:href="#c"/><image id="i1" xlink:href="https://evil/x.png"/></svg>`,
				PREFIX,
			),
		)
		expect(root.querySelector(`[id="${PREFIX}u1"]`)?.hasAttribute('href')).toBe(false)
		expect(root.querySelector(`[id="${PREFIX}u2"]`)?.getAttribute('href')).toBe(`#${PREFIX}b`)
		expect(root.querySelector(`[id="${PREFIX}i1"]`)?.hasAttribute('href')).toBe(false)
	})

	it('data-* атрибуты не пропускаются — разметка не подделает data-image-map-object', () => {
		const rect = parse(sanitizeSvg(wrap('<rect data-image-map-object="other" data-kind="shop"/>'), PREFIX)).querySelector('rect')
		expect(rect?.attributes).toHaveLength(0)
	})
})

describe('sanitizeSvg — векторы XSS (результат разбирается HTML-парсером, как в v-html)', () => {
	function renderHtml(markup: string): HTMLElement {
		const host = document.createElement('div')
		host.innerHTML = sanitizeSvg(markup, PREFIX)
		return host
	}

	function expectInert(host: HTMLElement): void {
		expect(host.querySelector('img, script, iframe, foreignObject, a, style, set, animate')).toBeNull()
		const attributes = [...host.querySelectorAll('*')].flatMap(element => [...element.attributes])
		expect(attributes.filter(attribute => attribute.name.startsWith('on') || /javascript:/i.test(attribute.value))).toEqual([])
		expect(host.innerHTML).not.toMatch(/<img|<!--|<\?/i)
	}

	it.each([
		['комментарий', '<!--><img src=x onerror=alert(1)>-->'],
		['инструкция обработки', '<?x ><img src=x onerror=alert(1)>?>'],
		['CDATA', '<text><![CDATA[</text><img src=x onerror=alert(1)>]]></text>'],
		['script', '<script>alert(1)</script>'],
		['foreignObject', '<foreignObject><img xmlns="http://www.w3.org/1999/xhtml" src="x" onerror="alert(1)"/></foreignObject>'],
		['обработчик on*', '<rect onclick="alert(1)" onmouseover="alert(1)"/>'],
		['ссылка javascript:', '<a href="javascript:alert(1)"><rect/></a><use href="javascript:alert(1)"/>'],
		['animate/set', '<set attributeName="onmouseover" to="alert(1)"/><animate attributeName="href" values="javascript:alert(1)"/>'],
		['текст с разметкой в title', '<title>&lt;img src=x onerror=alert(1)&gt;</title>'],
		['элемент внутри title', '<title><rect/><img xmlns="http://www.w3.org/1999/xhtml" src="x" onerror="alert(1)"/></title>'],
	])('%s — без исполняемого кода', (_name, body) => {
		expectInert(renderHtml(wrap(body)))
	})

	it('xlink:href с javascript: удаляется', () => {
		const host = renderHtml(
			`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="${XLINK}"><use xlink:href="javascript:alert(1)"/></svg>`,
		)
		expectInert(host)
		expect(host.querySelector('use')?.attributes).toHaveLength(0)
	})

	it('текст CDATA и title сохраняется как текст', () => {
		const host = renderHtml(wrap('<title>План &amp; схема</title><text><![CDATA[a < b]]></text>'))
		expect(host.querySelector('title')?.textContent).toBe('План & схема')
		expect(host.querySelector('text')?.textContent).toBe('a < b')
		expect(host.querySelector('title')?.children).toHaveLength(0)
	})

	it.each([
		['url(http)', 'fill: url(https://evil/x.svg)'],
		['url без кавычек с пробелом', 'fill: url (//evil/x)'],
		['image-set', 'fill: red; background-image: image-set("https://evil/x.png" 1x)'],
		['image-set в разрешённом свойстве', 'fill: image-set("https://evil/x.png" 1x)'],
		['экранирование', 'fill: u\\rl(//evil)'],
		['комментарий', 'fill: url/**/(//evil)'],
		['@import', '@import "x"; fill: red'],
	])('style с внешней ссылкой (%s) не пропускает её', (_name, style) => {
		const rect = renderHtml(wrap(`<rect style='${style}'/>`)).querySelector('rect') as Element
		expect(rect.getAttribute('style') ?? '').not.toMatch(/url|image-set|evil|@/)
	})

	it('style оставляет только свойства оформления с безопасными значениями', () => {
		const rect = renderHtml(
			wrap('<rect style="fill: rgb(1, 2, 3); stroke: url(#grad); position: fixed; opacity: 0.5; behavior: x; :broken"/>'),
		).querySelector('rect') as Element
		expect(rect.getAttribute('style')).toBe(`fill: rgb(1, 2, 3); stroke: url(#${PREFIX}grad); opacity: 0.5`)
	})

	it('style без допустимых свойств удаляется целиком', () => {
		expect(renderHtml(wrap('<rect style="position: fixed"/>')).querySelector('rect')?.hasAttribute('style')).toBe(false)
	})

	it('в значениях атрибутов разрешены только функции оформления', () => {
		const rect = renderHtml(
			wrap('<rect transform="translate(1 2) rotate(45)" fill="image-set(x)" stroke="hsl(1 2% 3%)" opacity="(1)"/>'),
		).querySelector('rect') as Element
		expect(rect.getAttribute('transform')).toBe('translate(1 2) rotate(45)')
		expect(rect.getAttribute('stroke')).toBe('hsl(1 2% 3%)')
		expect(rect.hasAttribute('fill')).toBe(false)
		expect(rect.hasAttribute('opacity')).toBe(false)
	})
})
