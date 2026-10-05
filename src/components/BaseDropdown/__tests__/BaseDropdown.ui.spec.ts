import '@testing-library/jest-dom/vitest'
import { defineComponent, ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseDropdown from '../ui/BaseDropdown.vue'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'

const SLOTS = { default: '<button type="button">Меню</button>', dropdown: '<div data-testid="item">Пункт</div>' }

const panel = () => document.querySelector<HTMLElement>('.base-dropdown__panel')

describe('BaseDropdown: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		const { container } = render(BaseDropdown, { props: { isOpen: true, showArrow: true }, slots: SLOTS })

		expect(container.firstElementChild).toHaveAttribute('class', 'base-dropdown')
		expect(document.querySelector('.base-dropdown__arrow')).toHaveAttribute('class', 'base-dropdown__arrow')
		expect(panel()).toHaveClass('base-dropdown__panel')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseDropdown, {
			props: {
				isOpen: true,
				showArrow: true,
				variant: 'outline',
				panelClass: 'own-panel',
				customClass: { root: 'own-root', panel: 'custom-panel' },
				ui: { root: 'u-root', panel: 'u-panel', arrow: 'u-arrow' },
			},
			slots: SLOTS,
		})

		expect(container.firstElementChild).toHaveClass('base-dropdown', 'u-root', 'own-root')
		expect(panel()).toHaveClass('base-dropdown__panel', 'u-panel', 'own-panel', 'custom-panel', 'base-dropdown__panel--outline')
		expect(document.querySelector('.base-dropdown__arrow')).toHaveClass('u-arrow')
	})

	it('классы из defaults.BaseDropdown.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseDropdown, {
			props: { isOpen: true, ui: { panel: 'own-panel' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseDropdown: { ui: { root: 'app-root', panel: 'app-panel' } } } })] },
		})

		expect(document.querySelector('.base-dropdown')).toHaveClass('app-root')
		expect(panel()).toHaveClass('base-dropdown__panel', 'app-panel', 'own-panel')
	})
})

describe('BaseDropdown: анимация панели', () => {
	it('по умолчанию scale, панель снизу от триггера', () => {
		render(BaseDropdown, { props: { isOpen: true }, slots: SLOTS })

		expect(panel()).toHaveClass('base-dropdown__panel--animation-scale', 'base-dropdown__panel--side-bottom')
	})

	it('заданная анимация и сторона панели по позиции', () => {
		render(BaseDropdown, { props: { isOpen: true, animation: 'slide', position: 'top-end' }, slots: SLOTS })

		expect(panel()).toHaveClass('base-dropdown__panel--animation-slide', 'base-dropdown__panel--side-top')
		expect(panel()).not.toHaveClass('base-dropdown__panel--animation-scale')
	})

	it('панель слева и справа от триггера получает свою сторону', async () => {
		const { rerender } = render(BaseDropdown, { props: { isOpen: true, position: 'left' }, slots: SLOTS })
		expect(panel()).toHaveClass('base-dropdown__panel--side-left')

		await rerender({ isOpen: true, position: 'right-start' })
		expect(panel()).toHaveClass('base-dropdown__panel--side-right')
	})

	it('умолчание из defaults.BaseDropdown.animation плагина', () => {
		render(BaseDropdown, {
			props: { isOpen: true },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseDropdown: { animation: 'fade' } } })] },
		})

		expect(panel()).toHaveClass('base-dropdown__panel--animation-fade')
	})

	it('появление и уход идут классами перехода base-dropdown на самой панели', async () => {
		const Host = defineComponent({
			components: { BaseDropdown },
			setup: () => ({ isOpen: ref(false) }),
			template: `
				<BaseDropdown v-model:is-open="isOpen" animation="pop">
					<button type="button" @click="isOpen = !isOpen">Меню</button>
					<template #dropdown><div data-testid="item">Пункт</div></template>
				</BaseDropdown>
			`,
		})
		render(Host, { global: { stubs: { Transition: false } } })

		await userEvent.click(screen.getByRole('button', { name: 'Меню' }))
		const opened = panel()
		expect(opened).toHaveClass('base-dropdown-enter-active', 'base-dropdown__panel--animation-pop')

		await userEvent.click(screen.getByRole('button', { name: 'Меню' }))
		expect(opened).toHaveClass('base-dropdown-leave-active')
		await waitFor(() => expect(panel()).toBeNull())
	})
})

describe('BaseDropdown: тема и движение области', () => {
	it('панель из области с data-rise-motion и data-rise-theme получает оба атрибута', async () => {
		const Host = defineComponent({
			components: { BaseDropdown },
			setup: () => ({ isOpen: ref(false) }),
			template: `
				<div data-rise-motion="subtle" data-rise-theme="playful">
					<BaseDropdown v-model:is-open="isOpen">
						<button type="button" @click="isOpen = !isOpen">Меню</button>
						<template #dropdown><div data-testid="item">Пункт</div></template>
					</BaseDropdown>
				</div>
			`,
		})
		render(Host)

		await userEvent.click(screen.getByRole('button', { name: 'Меню' }))
		const opened = (await screen.findByTestId('item')).closest('.base-dropdown__panel')

		expect(opened).toHaveAttribute('data-rise-motion', 'subtle')
		expect(opened).toHaveAttribute('data-rise-theme', 'playful')
	})
})
