import '@testing-library/jest-dom/vitest'
import BaseAlert from '../ui/BaseAlert.vue'
import { createUiKitPlugin } from '@/plugin'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const PROPS = { title: 'Сохранено', description: 'Изменения сохранены', isClosable: true }
const SLOTS = { actions: '<button type="button">Отменить</button>' }
const PARTS = ['icon-wrapper', 'content', 'title', 'description', 'text', 'actions', 'close'] as const

const part = (name: string) => document.querySelector(`.base-alert__${name}`)
const transitionOn = { global: { stubs: { Transition: false } } }

describe('BaseAlert: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		render(BaseAlert, { props: PROPS, slots: SLOTS })
		const root = screen.getByRole('status')

		expect(root.className).toMatch(/^base-alert /)
		expect(part('icon-wrapper')).toHaveAttribute('class', 'base-alert__icon-wrapper')
		expect(part('content')).toHaveAttribute('class', 'base-alert__content')
		expect(part('description')).toHaveAttribute('class', 'base-alert__description')
		expect(part('actions')).toHaveAttribute('class', 'base-alert__actions')
		expect(part('title')).toHaveClass('base-text')
		expect(part('text')).toHaveClass('base-text')
		expect(part('close')).toHaveClass('base-button')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(name => [name, `u-${name}`])])
		render(BaseAlert, { props: { ...PROPS, variant: 'soft', type: 'success', customClass: 'own-root', ui }, slots: SLOTS })
		const root = screen.getByRole('status')

		expect(root).toHaveClass('base-alert', 'u-root', 'base-alert--success', 'base-alert--soft', 'own-root')
		for (const name of PARTS) expect(part(name)).toHaveClass(`base-alert__${name}`, `u-${name}`)
	})

	it('классы из defaults.BaseAlert.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseAlert, {
			props: { ...PROPS, ui: { content: 'own-content' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseAlert: { ui: { root: 'app-root', content: 'app-content' } } } })] },
		})

		expect(screen.getByRole('status')).toHaveClass('base-alert', 'app-root')
		expect(part('content')).toHaveAttribute('class', 'base-alert__content app-content own-content')
	})
})

describe('BaseAlert: уход при закрытии', () => {
	afterEach(() => {
		document.documentElement.removeAttribute('data-rise-reduced-motion')
	})

	it('кнопка «Закрыть» запускает уход, close приходит после анимации, оповещение уходит из разметки', async () => {
		const { emitted } = render(BaseAlert, { props: PROPS, ...transitionOn })
		const root = screen.getByRole('status')

		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))

		expect(root).toHaveClass('base-alert-leave-active')
		expect(emitted()).not.toHaveProperty('close')
		await waitFor(() => expect(emitted().close).toHaveLength(1))
		expect(screen.queryByRole('status')).not.toBeInTheDocument()
	})

	it('при выключенном движении — сразу: без классов ухода, close в том же клике', async () => {
		document.documentElement.setAttribute('data-rise-reduced-motion', 'always')
		const { emitted } = render(BaseAlert, { props: PROPS, ...transitionOn })

		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))

		expect(emitted().close).toHaveLength(1)
		expect(screen.queryByRole('status')).not.toBeInTheDocument()
		expect(document.querySelector('.base-alert-leave-active')).toBeNull()
	})

	it('пресет none на контейнере тоже закрывает сразу', async () => {
		const host = document.createElement('div')
		host.setAttribute('data-rise-motion', 'none')
		document.body.append(host)
		const { emitted } = render(BaseAlert, { props: PROPS, container: host, ...transitionOn })

		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))

		expect(emitted().close).toHaveLength(1)
		expect(screen.queryByRole('status')).not.toBeInTheDocument()
		host.remove()
	})
})
