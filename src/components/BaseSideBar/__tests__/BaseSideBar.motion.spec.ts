import '@testing-library/jest-dom/vitest'
import BaseSideBar from '../ui/BaseSideBar.vue'
import type { SideBarItem } from '../types/BaseSideBar.types'
import { preventLinkNavigation } from './BaseSideBar.test-utils'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

preventLinkNavigation()

const ITEMS: SideBarItem[] = [
	{ key: 'home', label: 'Главная', icon: 'home', to: '/home' },
	{
		key: 'settings',
		label: 'Настройки',
		icon: 'settings',
		children: [
			{ key: 'profile', label: 'Профиль', to: '/settings/profile' },
			{ key: 'security', label: 'Безопасность', to: '/settings/security' },
		],
	},
]
const PROPS = { title: 'Панель', items: ITEMS, linkComponent: 'a' }
const transitionOn = { global: { stubs: { Transition: false } } }

const sidebar = () => screen.getByRole('complementary')
const settings = () => screen.getByRole('button', { name: 'Настройки' })

afterEach(() => {
	document.documentElement.removeAttribute('data-rise-motion')
	document.documentElement.removeAttribute('data-rise-reduced-motion')
})

describe('BaseSideBar: сворачивание панели', () => {
	it('сначала гаснут подписи, затем панель сужается', async () => {
		const { emitted } = render(BaseSideBar, { props: PROPS })

		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть' }))

		expect(emitted()['update:isCollapsed']).toEqual([[true]])
		expect(screen.getByRole('button', { name: 'Развернуть' })).toBeInTheDocument()
		expect(sidebar()).toHaveClass('base-side-bar--labels-out')
		expect(sidebar()).not.toHaveClass('base-side-bar--collapsed')
		expect(screen.getByText('Панель')).toBeInTheDocument()

		await waitFor(() => expect(sidebar()).toHaveClass('base-side-bar--collapsed'))
		expect(sidebar()).not.toHaveClass('base-side-bar--labels-out')
		expect(screen.queryByText('Панель')).not.toBeInTheDocument()
	})

	it('при разворачивании панель расширяется сразу, подписи проявляются после ширины', async () => {
		const { rerender } = render(BaseSideBar, { props: { ...PROPS, isCollapsed: true } })
		expect(sidebar()).toHaveClass('base-side-bar--collapsed')

		await rerender({ ...PROPS, isCollapsed: false })

		expect(sidebar()).not.toHaveClass('base-side-bar--collapsed')
		expect(sidebar()).toHaveClass('base-side-bar--labels-in')
		expect(screen.getByText('Панель')).toBeInTheDocument()
		await waitFor(() => expect(sidebar()).not.toHaveClass('base-side-bar--labels-in'))
	})

	it('повторное нажатие, пока подписи гаснут, отменяет сворачивание', async () => {
		render(BaseSideBar, { props: PROPS })

		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть' }))
		await fireEvent.click(screen.getByRole('button', { name: 'Развернуть' }))

		expect(sidebar()).not.toHaveClass('base-side-bar--labels-out')
		expect(sidebar()).not.toHaveClass('base-side-bar--labels-in')
		await new Promise(resolve => setTimeout(resolve, 250))
		expect(sidebar()).not.toHaveClass('base-side-bar--collapsed')
	})

	it('пресет none — сразу конечное состояние в обе стороны', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		render(BaseSideBar, { props: PROPS })

		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть' }))
		expect(sidebar()).toHaveClass('base-side-bar--collapsed')
		expect(sidebar()).not.toHaveClass('base-side-bar--labels-out')

		await fireEvent.click(screen.getByRole('button', { name: 'Развернуть' }))
		expect(sidebar()).not.toHaveClass('base-side-bar--collapsed')
		expect(sidebar()).not.toHaveClass('base-side-bar--labels-in')
	})

	it("reducedMotion: 'always' — сразу конечное состояние", async () => {
		document.documentElement.setAttribute('data-rise-reduced-motion', 'always')
		render(BaseSideBar, { props: PROPS })

		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть' }))

		expect(sidebar()).toHaveClass('base-side-bar--collapsed')
	})

	it('размонтирование во время анимации не меняет состояние после ухода', async () => {
		const { unmount } = render(BaseSideBar, { props: PROPS })

		await fireEvent.click(screen.getByRole('button', { name: 'Свернуть' }))
		unmount()

		await new Promise(resolve => setTimeout(resolve, 200))
		expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
	})
})

describe('BaseSideBar: раскрытие подменю', () => {
	it('подменю раскрывается переходом, aria-controls указывает на список в разметке', async () => {
		render(BaseSideBar, { props: PROPS, ...transitionOn })

		expect(settings()).toHaveAttribute('aria-expanded', 'false')
		expect(settings()).not.toHaveAttribute('aria-controls')

		await fireEvent.click(settings())

		const id = settings().getAttribute('aria-controls')!
		const region = document.getElementById(id)
		expect(settings()).toHaveAttribute('aria-expanded', 'true')
		expect(region).toHaveClass('base-side-bar-nav__collapse')
		expect(region).toHaveTextContent('Профиль')
		expect(region!.className).toContain('base-side-bar-nav-expand-enter')
	})

	it('при сворачивании подменю aria-controls снимается сразу, список уходит из разметки', async () => {
		render(BaseSideBar, { props: PROPS, ...transitionOn })
		await fireEvent.click(settings())

		await fireEvent.click(settings())

		expect(settings()).toHaveAttribute('aria-expanded', 'false')
		expect(settings()).not.toHaveAttribute('aria-controls')
		await waitFor(() => expect(screen.queryByRole('link', { name: 'Профиль' })).not.toBeInTheDocument())
	})

	it('пункт с to показывает детей всегда и без aria-controls', () => {
		const items: SideBarItem[] = [
			{ key: 'catalog', label: 'Каталог', to: '/catalog', children: [{ key: 'a', label: 'Товары', to: '/a' }] },
		]
		render(BaseSideBar, { props: { ...PROPS, items } })

		expect(screen.getByRole('link', { name: 'Каталог' })).not.toHaveAttribute('aria-controls')
		expect(screen.getByRole('link', { name: 'Товары' })).toBeInTheDocument()
	})

	it('пресет none — подменю раскрывается без классов перехода', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		render(BaseSideBar, { props: PROPS, ...transitionOn })

		await fireEvent.click(settings())

		const region = document.getElementById(settings().getAttribute('aria-controls')!)
		expect(region).toHaveAttribute('class', 'base-side-bar-nav__collapse')
		expect(screen.getByRole('link', { name: 'Профиль' })).toBeInTheDocument()
	})
})
