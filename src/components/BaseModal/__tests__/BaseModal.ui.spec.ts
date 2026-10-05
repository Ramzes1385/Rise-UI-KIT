import '@testing-library/jest-dom/vitest'
import BaseModal from '../ui/BaseModal.vue'
import { createUiKitPlugin } from '@/plugin'
import { render, screen } from '@testing-library/vue'

const SLOTS = { default: 'Текст окна', footer: '<button type="button">Ок</button>' }

afterEach(() => {
	document.body.innerHTML = ''
})

function root(): HTMLElement {
	return screen.getByRole('dialog').parentElement!
}

describe('BaseModal: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам, глобальные — из defaults плагина', async () => {
		render(BaseModal, {
			props: { isOpen: true, title: 'Окно', ui: { root: 'u-root', content: 'u-content', title: 'u-title', footer: 'u-footer' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseModal: { ui: { body: 'g-body', content: 'g-content' } } } })] },
		})
		const dialog = await screen.findByRole('dialog')

		expect(root()).toHaveClass('base-modal', 'u-root')
		expect(dialog).toHaveClass('base-modal__content', 'g-content', 'u-content')
		expect(dialog.querySelector('.base-modal__title')).toHaveClass('u-title')
		expect(dialog.querySelector('.base-modal__body')).toHaveClass('g-body')
		expect(dialog.querySelector('.base-modal__footer')).toHaveClass('u-footer')
		expect(dialog.querySelector('.base-modal__header-left')).toBeInTheDocument()
		expect(dialog.querySelector('.base-modal__close')).toBeInTheDocument()
	})
})

describe('BaseModal: проп animation', () => {
	it('по умолчанию scale, заданный и из defaults.global', async () => {
		const { rerender } = render(BaseModal, { props: { isOpen: true, title: 'Окно' }, slots: SLOTS })
		await screen.findByRole('dialog')
		expect(root()).toHaveClass('base-modal--animation-scale')

		await rerender({ animation: 'slide' })
		expect(root()).toHaveClass('base-modal--animation-slide')
	})

	it('defaults.global.animation плагина', async () => {
		render(BaseModal, {
			props: { isOpen: true, title: 'Окно' },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { global: { animation: 'none' } } })] },
		})
		await screen.findByRole('dialog')
		expect(root()).toHaveClass('base-modal--animation-none')
	})
})

describe('BaseModal: тема и движение области', () => {
	it('телепортированное окно получает data-rise-theme, data-theme и data-rise-motion места в разметке', async () => {
		const area = document.createElement('div')
		area.setAttribute('data-rise-motion', 'subtle')
		area.setAttribute('data-rise-theme', 'playful')
		area.setAttribute('data-theme', 'dark')
		document.body.append(area)

		render(BaseModal, { props: { isOpen: true, title: 'Окно' }, slots: SLOTS, container: area })
		await screen.findByRole('dialog')

		expect(area.contains(root())).toBe(false)
		expect(root()).toHaveAttribute('data-rise-motion', 'subtle')
		expect(root()).toHaveAttribute('data-rise-theme', 'playful')
		expect(root()).toHaveAttribute('data-theme', 'dark')
	})
})
