import '@testing-library/jest-dom/vitest'
import { mount } from '@vue/test-utils'
import type { MockInstance } from 'vitest'
import BaseQrCode from '../ui/BaseQrCode.vue'
import { foreignOrigin, isSafeLogo } from '../model/qrLogoUrl'

const URL = 'https://rise-ui.dev'

const PNG = 'data:image/png;base64,iVBORw0KGgo='

let warnSpy: MockInstance<typeof console.warn>

const warnings = (): string[] => warnSpy.mock.calls.map(call => String(call[0]))

beforeEach(() => {
	warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => warnSpy.mockRestore())

describe('BaseQrCode: схемы логотипа', () => {
	it.each([
		'javascript:alert(1)',
		' java\tscript:alert(1)',
		'vbscript:msgbox(1)',
		'data:text/html,<script>1</script>',
		'data:image/x-icon;base64,AA',
	])('%s — логотип не рисуется, уровень без логотипа (M), предупреждение один раз', async logo => {
		const wrapper = mount(BaseQrCode, { props: { value: URL, logo, margin: 0 } })
		expect(wrapper.find('image').exists()).toBe(false)
		expect(wrapper.find('svg').attributes('viewBox')).toBe('0 0 25 25')
		expect(wrapper.vm.getSvg()).not.toContain('<image')
		await wrapper.setProps({ size: 120 })
		mount(BaseQrCode, { props: { value: 'другой', logo } }).unmount()
		expect(warnings().filter(text => text.includes('небезопасной схемой'))).toHaveLength(1)
		wrapper.unmount()
	})

	it.each([PNG, 'DATA:image/svg+xml;utf8,<svg/>', '/logo.svg', 'logo.png', 'blob:https://rise-ui.dev/1f2e'])('%s — рисуется', logo => {
		const wrapper = mount(BaseQrCode, { props: { value: URL, logo } })
		expect(wrapper.find('image').attributes('href')).toBe(logo)
		expect(warnings()).toEqual([])
		wrapper.unmount()
	})

	it('длинный data URI в предупреждении обрезан до 80 символов', () => {
		const logo = `data:text/plain,${'x'.repeat(200)}`
		mount(BaseQrCode, { props: { value: URL, logo } }).unmount()
		expect(warnings()[0]).toContain(logo.slice(0, 80))
		expect(warnings()[0]).not.toContain(logo.slice(0, 81))
	})
})

describe('BaseQrCode: внешний логотип', () => {
	it('чужой https — предупреждение один раз с origin, логотип рисуется', () => {
		const first = mount(BaseQrCode, { props: { value: URL, logo: 'https://cdn.example.org/logo.png' } })
		const second = mount(BaseQrCode, { props: { value: URL, logo: 'https://cdn.example.org/other.png' } })
		expect(first.find('image').exists()).toBe(true)
		expect(warnings()).toHaveLength(1)
		expect(warnings()[0]).toContain('https://cdn.example.org')
		first.unmount()
		second.unmount()
	})

	it('свой origin и относительный адрес — без предупреждения', () => {
		mount(BaseQrCode, { props: { value: URL, logo: `${window.location.origin}/logo.png` } }).unmount()
		mount(BaseQrCode, { props: { value: URL, logo: '/static/logo.png' } }).unmount()
		expect(warnings()).toEqual([])
	})

	it('foreignOrigin: протокол-относительный адрес — чужой, blob и data — нет, без window — null', () => {
		expect(foreignOrigin('//cdn.example.net/logo.png')).toBe('http://cdn.example.net')
		expect(foreignOrigin(PNG)).toBeNull()
		expect(foreignOrigin('http://[bad')).toBeNull()
		vi.stubGlobal('window', undefined)
		expect(foreignOrigin('https://cdn.example.org/logo.png')).toBeNull()
		vi.unstubAllGlobals()
	})

	it('isSafeLogo: управляющие символы перед data: не обходят проверку', () => {
		expect(isSafeLogo('\u0001data:text/html,1')).toBe(false)
		expect(isSafeLogo('\u0001data:image/webp;base64,AA')).toBe(true)
		expect(isSafeLogo('')).toBe(false)
	})
})

describe('BaseQrCode: контраст и поле', () => {
	it('инверсия (белые модули на чёрном) — предупреждение', () => {
		mount(BaseQrCode, { props: { value: URL, moduleColor: '#ffffff', backgroundColor: '#000000' } }).unmount()
		expect(warnings()).toHaveLength(1)
		expect(warnings()[0]).toContain('светлее фона')
	})

	it('низкий контраст #777 на #888 — предупреждение с отношением', () => {
		mount(BaseQrCode, { props: { value: URL, moduleColor: '#777', backgroundColor: '#888' } }).unmount()
		expect(warnings()).toHaveLength(1)
		expect(warnings()[0]).toMatch(/контраст .* — 1\.\d\d:1/)
	})

	it('цвет «глазков» тоже проверяется; rgb() разбирается', () => {
		mount(BaseQrCode, {
			props: { value: URL, moduleColor: 'rgb(20, 20, 20)', finderColor: '#a0a0a0', backgroundColor: '#ffffff' },
		}).unmount()
		expect(warnings()).toHaveLength(1)
		expect(warnings()[0]).toContain('#a0a0a0')
	})

	it('чёрный на белом, неразборчивые цвета (var()) — без предупреждения', () => {
		mount(BaseQrCode, { props: { value: URL } }).unmount()
		mount(BaseQrCode, { props: { value: URL, moduleColor: 'var(--brand)', backgroundColor: '#fff' } }).unmount()
		mount(BaseQrCode, { props: { value: URL, moduleColor: '#1e3a8a', finderColor: '#1e3a8a', backgroundColor: '#eff6ff' } }).unmount()
		expect(warnings()).toEqual([])
	})

	it('поле меньше 2 — предупреждение; 2 — нет', async () => {
		const wrapper = mount(BaseQrCode, { props: { value: URL, margin: 2 } })
		expect(warnings()).toEqual([])
		await wrapper.setProps({ margin: 1 })
		expect(warnings()).toHaveLength(1)
		expect(warnings()[0]).toContain('— 1 в модулях')
		wrapper.unmount()
	})
})
