import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseHeader from '../ui/BaseHeader.vue'

function resizeTo(width: number): void {
	Object.defineProperty(window, 'innerWidth', { value: width, configurable: true })
	window.dispatchEvent(new Event('resize'))
}

afterEach(() => resizeTo(1024))

/** Кнопку «Меню» показывает только медиазапрос узкого экрана — в jsdom она скрыта, поэтому ищем её по классу */
function toggleButton(): HTMLElement {
	return document.querySelector('.base-header__toggle') as HTMLElement
}

describe('BaseHeader unit', () => {
	it('рендерит <header> с названием, навигацией и действиями', () => {
		const { container } = render(BaseHeader, {
			props: { title: 'Rise' },
			slots: { default: '<nav aria-label="Основное">Разделы</nav>', end: '<button>Профиль</button>' },
		})
		const header = screen.getByRole('banner')
		expect(header).toHaveClass('base-header--sticky')
		expect(container.querySelector('.base-header__title')).toHaveTextContent('Rise')
		expect(screen.getByRole('navigation', { name: 'Основное' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Профиль' })).toBeInTheDocument()
		expect(toggleButton()).toBeNull()
	})

	it('с href название — ссылка', () => {
		render(BaseHeader, { props: { title: 'Rise', href: '/' } })
		expect(screen.getByRole('link', { name: 'Rise' })).toHaveAttribute('href', '/')
	})

	it('слот start заменяет название; без title и слота начало пустое', () => {
		const { container, rerender } = render(BaseHeader, { slots: { start: '<img alt="Rise" src="logo.svg" />' } })
		expect(screen.getByRole('img', { name: 'Rise' })).toBeInTheDocument()
		void rerender({})
		expect(container.querySelector('.base-header__title')).not.toBeInTheDocument()
	})

	it('вариант, ширина, isSticky=false и customClass', () => {
		const { container } = render(BaseHeader, {
			props: { variant: 'ghost', containerSize: 'xl', isSticky: false, customClass: { inner: 'my-inner' } },
		})
		const header = container.querySelector('.base-header') as HTMLElement
		expect(header).toHaveClass('base-header--ghost')
		expect(header).not.toHaveClass('base-header--sticky')
		expect(container.querySelector('.base-header__inner')).toHaveClass('base-container--xl', 'my-inner')
	})

	it('кнопка «Меню» открывает выдвижное меню, close из слота закрывает его', async () => {
		render(BaseHeader, {
			props: { title: 'Rise' },
			slots: { menu: `<template #menu="{ close }"><button @click="close">Заказы</button></template>` },
		})
		const toggle = toggleButton()
		expect(toggle).toHaveAttribute('aria-label', 'Меню')
		expect(toggle).toHaveAttribute('aria-expanded', 'false')
		expect(toggle).toHaveAttribute('aria-haspopup', 'dialog')
		await fireEvent.click(toggle)
		expect(await screen.findByRole('dialog', { name: 'Меню' })).toBeInTheDocument()
		expect(toggle).toHaveAttribute('aria-expanded', 'true')
		await fireEvent.click(screen.getByRole('button', { name: 'Заказы' }))
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('menuLabel и menuDirection; openMenu/closeMenu из ref', async () => {
		const { container } = render(BaseHeader, {
			props: { menuLabel: 'Навигация', menuDirection: 'left' },
			slots: { menu: 'Ссылки' },
		})
		expect(container.querySelector('.base-header')).toHaveClass('base-header--has-menu')
		expect(toggleButton()).toHaveAttribute('aria-label', 'Навигация')
		await fireEvent.click(toggleButton())
		expect(document.querySelector('.base-drawer__panel--left')).toBeInTheDocument()
		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('окно стало шире 768px — выдвижное меню закрывается', async () => {
		resizeTo(500)
		render(BaseHeader, { slots: { menu: 'Ссылки' } })
		await fireEvent.click(toggleButton())
		expect(screen.getByRole('dialog')).toBeInTheDocument()
		resizeTo(500)
		await nextTick()
		expect(screen.getByRole('dialog')).toBeInTheDocument()
		resizeTo(1200)
		await nextTick()
		await nextTick()
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})

	it('методы openMenu и closeMenu', async () => {
		const { container } = render({
			components: { BaseHeader },
			template: `<div><BaseHeader ref="header"><template #menu>Ссылки</template></BaseHeader>
				<button @click="$refs.header.openMenu()">open</button><button @click="$refs.header.closeMenu()">close</button></div>`,
		})
		await fireEvent.click(screen.getByRole('button', { name: 'open' }))
		expect(screen.getByRole('dialog')).toBeInTheDocument()
		expect(container).toBeInTheDocument()
		await fireEvent.click(screen.getByRole('button', { name: 'close', hidden: true }))
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
	})
})
