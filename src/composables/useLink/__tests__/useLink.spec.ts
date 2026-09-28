import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { LINK_COMPONENT_KEY, resolveLink, useLinkComponent } from '../useLink'
import type { LinkComponent } from '../useLink.types'
import type { Component } from 'vue'

const RouterLinkStub = defineComponent({ name: 'RouterLinkStub', render: () => h('a') })
const NuxtLinkStub = defineComponent({ name: 'NuxtLinkStub', render: () => h('a') })

afterEach(() => {
	vi.restoreAllMocks()
})

describe('useLinkComponent', () => {
	function resolveInApp(options: { provided?: LinkComponent; registered?: LinkComponent; explicit?: LinkComponent }) {
		let result: LinkComponent | undefined
		mount(
			defineComponent({
				setup() {
					result = useLinkComponent(options.explicit)
					return () => null
				},
			}),
			{
				global: {
					provide: options.provided ? { [LINK_COMPONENT_KEY as symbol]: options.provided } : {},
					components: options.registered ? { RouterLink: options.registered as Component } : {},
				},
			},
		)
		return result
	}

	it('проп компонента важнее настроек приложения', () => {
		expect(resolveInApp({ explicit: 'span', provided: NuxtLinkStub, registered: RouterLinkStub })).toBe('span')
	})

	it('затем linkComponent из плагина, затем RouterLink приложения', () => {
		expect(resolveInApp({ provided: NuxtLinkStub, registered: RouterLinkStub })).toBe(NuxtLinkStub)
		expect(resolveInApp({ registered: RouterLinkStub })).toBe(RouterLinkStub)
	})

	it('без роутера и вне компонента — обычная ссылка', () => {
		expect(resolveInApp({})).toBe('a')
		expect(useLinkComponent()).toBe('a')
	})
})

describe('resolveLink', () => {
	it('href — ссылка <a>; для _blank добавляется noopener noreferrer', () => {
		expect(resolveLink({ href: 'https://example.com' })).toEqual({
			is: 'a',
			attrs: { href: 'https://example.com', target: undefined, rel: undefined },
			hasTarget: true,
		})
		expect(resolveLink({ href: 'https://example.com', target: '_blank' }).attrs.rel).toBe('noopener noreferrer')
		expect(resolveLink({ href: 'https://example.com', target: '_blank', rel: 'nofollow noopener' }).attrs).toEqual({
			href: 'https://example.com',
			target: '_blank',
			rel: 'nofollow noopener noreferrer',
		})
	})

	it('маршрут — компонент ссылок с to; без него — <a href>', () => {
		expect(resolveLink({ to: '/docs' }, RouterLinkStub)).toEqual({ is: RouterLinkStub, attrs: { to: '/docs', target: undefined, rel: undefined }, hasTarget: true })
		expect(resolveLink({ to: { name: 'user' } }, RouterLinkStub).attrs.to).toEqual({ name: 'user' })
		expect(resolveLink({ to: '/docs' })).toEqual({ is: 'a', attrs: { href: '/docs', target: undefined, rel: undefined }, hasTarget: true })
	})

	it('внешний адрес в to открывается обычной ссылкой, даже с RouterLink', () => {
		expect(resolveLink({ to: 'https://example.com' }, RouterLinkStub).is).toBe('a')
	})

	it('отключённая ссылка и ссылка без адреса — <a> без href с aria-disabled', () => {
		const disabled = { is: 'a', attrs: { 'aria-disabled': 'true', role: 'link' }, hasTarget: false }
		expect(resolveLink({ href: '/docs', isDisabled: true })).toEqual(disabled)
		expect(resolveLink({})).toEqual(disabled)
	})

	it('небезопасная схема: ссылка без адреса и одно предупреждение на адрес', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

		expect(resolveLink({ href: 'javascript:alert(1)' }).hasTarget).toBe(false)
		expect(resolveLink({ href: 'javascript:alert(1)' }).hasTarget).toBe(false)
		expect(resolveLink({ to: 'data:text/html,<script>' }, RouterLinkStub).hasTarget).toBe(false)
		expect(warn).toHaveBeenCalledTimes(2)
	})

	it('объект to без компонента ссылок — без адреса, с подсказкой в консоли', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

		expect(resolveLink({ to: { name: 'user' } }).hasTarget).toBe(false)
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('linkComponent'))
	})
})
