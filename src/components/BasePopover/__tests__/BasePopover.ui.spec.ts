import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BasePopover from '../ui/BasePopover.vue'
import { render, screen } from '@testing-library/vue'

const SLOTS = { trigger: '<button type="button">Подробнее</button>', default: '<p>Текст</p>' }

const panel = () => document.querySelector<HTMLElement>('.base-dropdown__panel')
const part = (name: string) => document.querySelector(`.base-popover__${name}`)

describe('BasePopover: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		const { container } = render(BasePopover, { props: { isOpen: true }, slots: SLOTS })

		expect(container.firstElementChild).toHaveAttribute('class', 'base-dropdown base-popover')
		expect(part('trigger')).toHaveAttribute('class', 'base-popover__trigger')
		expect(part('inner')).toHaveAttribute('class', 'base-popover__inner')
		expect(panel()).toHaveClass('base-popover__panel', 'base-popover__panel--default')
		expect(part('arrow')).toHaveClass('base-dropdown__arrow')
	})

	it('классы частей добавляются к классам кита, customClass сохраняется', () => {
		const ui = { root: 'u-root', trigger: 'u-trigger', panel: 'u-panel', inner: 'u-inner', arrow: 'u-arrow' }
		const { container } = render(BasePopover, {
			props: { isOpen: true, variant: 'soft', ui, customClass: { root: 'own-root', inner: 'own-inner' } },
			slots: SLOTS,
		})

		expect(container.firstElementChild).toHaveClass('base-popover', 'u-root', 'own-root')
		expect(part('trigger')).toHaveClass('u-trigger')
		expect(part('inner')).toHaveClass('base-popover__inner', 'u-inner', 'own-inner')
		expect(panel()).toHaveClass('base-popover__panel', 'u-panel', 'base-popover__panel--soft')
		expect(part('arrow')).toHaveClass('u-arrow')
	})

	it('классы из defaults.BasePopover.ui плагина склеиваются с классами экземпляра', () => {
		render(BasePopover, {
			props: { isOpen: true, ui: { inner: 'own-inner' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BasePopover: { ui: { inner: 'app-inner' } } } })] },
		})

		expect(part('inner')).toHaveAttribute('class', 'base-popover__inner app-inner own-inner')
	})
})

describe('BasePopover: анимация', () => {
	it('по умолчанию scale, панель снизу от триггера', () => {
		render(BasePopover, { props: { isOpen: true }, slots: SLOTS })

		expect(panel()).toHaveClass('base-dropdown__panel--animation-scale', 'base-dropdown__panel--side-bottom')
	})

	it('проп animation уходит в панель', () => {
		render(BasePopover, { props: { isOpen: true, animation: 'fade', position: 'left' }, slots: SLOTS })

		expect(panel()).toHaveClass('base-dropdown__panel--animation-fade', 'base-dropdown__panel--side-left')
		expect(screen.getByRole('dialog')).toBeInTheDocument()
	})
})
