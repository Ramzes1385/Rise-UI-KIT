/**
 * Unit-тесты BaseLink: маршрут и внешний адрес, компонент ссылок, новая вкладка, отключённая и небезопасная ссылка.
 */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { defineComponent, h } from 'vue'
import { LINK_COMPONENT_KEY } from '@composables/useLink'
import BaseLink from '../ui/BaseLink.vue'

/** Как RouterLink: получает to и рендерит <a> */
const RouterLinkStub = defineComponent({
	name: 'RouterLinkStub',
	props: { to: { type: [String, Object], required: true } },
	setup: (props, { slots }) => () => h('a', { href: typeof props.to === 'string' ? props.to : '/resolved', 'data-router': '' }, slots.default?.()),
})

afterEach(() => {
	vi.restoreAllMocks()
})

describe('BaseLink', () => {
	it('маршрут без роутера — <a href> с текстом из label', () => {
		render(BaseLink, { props: { to: '/docs', label: 'Документация' } })

		expect(screen.getByRole('link', { name: 'Документация' })).toHaveAttribute('href', '/docs')
	})

	it('слот default заменяет label', () => {
		render(BaseLink, { props: { href: '/docs', label: 'Не видно' }, slots: { default: 'Из слота' } })

		expect(screen.getByRole('link', { name: 'Из слота' })).toBeInTheDocument()
	})

	it('маршрут рендерится компонентом ссылок: из пропа, из плагина, RouterLink приложения', () => {
		render(BaseLink, { props: { to: { name: 'docs' }, label: 'Проп', linkComponent: RouterLinkStub } })
		expect(screen.getByRole('link', { name: 'Проп' })).toHaveAttribute('data-router')

		render(BaseLink, { props: { to: '/a', label: 'Плагин' }, global: { provide: { [LINK_COMPONENT_KEY as symbol]: RouterLinkStub } } })
		expect(screen.getByRole('link', { name: 'Плагин' })).toHaveAttribute('data-router')

		render(BaseLink, { props: { to: '/b', label: 'Роутер' }, global: { components: { RouterLink: RouterLinkStub } } })
		expect(screen.getByRole('link', { name: 'Роутер' })).toHaveAttribute('data-router')
	})

	it('новая вкладка: rel noopener noreferrer, стрелка и подсказка для скринридера', () => {
		render(BaseLink, { props: { href: 'https://example.com', target: '_blank', rel: 'nofollow', label: 'Руководство' } })

		const link = screen.getByRole('link', { name: 'Руководство (откроется в новой вкладке)' })
		expect(link).toHaveAttribute('target', '_blank')
		expect(link).toHaveAttribute('rel', 'nofollow noopener noreferrer')
		expect(link.querySelector('.base-link__external [aria-hidden="true"]')).toHaveTextContent('↗')
	})

	it('клик эмитит click; у отключённой ссылки — нет адреса, клик гасится', async () => {
		const { emitted, rerender } = render(BaseLink, { props: { href: '#details', label: 'Подробнее' } })
		await fireEvent.click(screen.getByRole('link', { name: 'Подробнее' }))
		expect(emitted().click).toHaveLength(1)

		await rerender({ isDisabled: true })
		const link = screen.getByRole('link', { name: 'Подробнее' })
		expect(link).not.toHaveAttribute('href')
		expect(link).toHaveAttribute('aria-disabled', 'true')
		expect(link).toHaveClass('base-link--disabled')
		const click = new MouseEvent('click', { bubbles: true, cancelable: true })
		link.dispatchEvent(click)
		expect(click.defaultPrevented).toBe(true)
		expect(emitted().click).toHaveLength(1)
	})

	it('небезопасный адрес не попадает в href', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		render(BaseLink, { props: { href: 'javascript:alert(1)', label: 'Ссылка' } })

		expect(screen.getByRole('link', { name: 'Ссылка' })).not.toHaveAttribute('href')
	})

	it('вариант, масштаб, цвет и customClass', () => {
		render(BaseLink, {
			props: {
				href: '/docs',
				label: 'Ссылка',
				variant: 'ghost',
				sizeScale: 125,
				color: { text: { base: 'var(--rise-success-text)' } },
				customClass: { root: 'my-root', external: 'my-external' },
				target: '_blank',
			},
		})

		const link = screen.getByRole('link')
		expect(link).toHaveClass('base-link', 'base-link--ghost', 'my-root')
		expect(link.style.getPropertyValue('--size-scale')).toBe('1.25')
		expect(link.style.getPropertyValue('--custom-text')).toBe('var(--rise-success-text)')
		expect(link.querySelector('.base-link__external')).toHaveClass('my-external')
	})
})
