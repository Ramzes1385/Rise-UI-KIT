import { sanitizeSvg } from '../../model/svg/sanitizeSvg'

const PREFIX = 'rise-im-t-'
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
		expect([...rect.attributes].map(attribute => attribute.name).sort()).toEqual(['class', 'data-kind', 'opacity'])
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

	it('xlink:href у use тоже получает префикс', () => {
		const result = sanitizeSvg(
			'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><use xlink:href="#a"/></svg>',
			PREFIX,
		)
		expect(parse(result).querySelector('use')?.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe(`#${PREFIX}a`)
	})
})
