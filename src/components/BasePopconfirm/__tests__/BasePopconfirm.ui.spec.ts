import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BasePopconfirm from '../ui/BasePopconfirm.vue'
import { render, screen } from '@testing-library/vue'

const PROPS = { title: 'Удалить серию?', description: 'Действие нельзя отменить.', isOpen: true, isDanger: true }
const SLOTS = { default: '<button type="button">Удалить</button>' }
const PARTS = ['header', 'icon', 'title', 'description', 'actions'] as const

const panel = () => document.querySelector<HTMLElement>('.base-dropdown__panel')
const part = (name: string) => document.querySelector(`.base-popconfirm__${name}`)

describe('BasePopconfirm: проп ui', () => {
	it('без ui — только классы кита на частях', () => {
		render(BasePopconfirm, { props: PROPS, slots: SLOTS })

		expect(screen.getByRole('alertdialog')).toHaveAttribute('class', 'base-popconfirm')
		expect(part('header')).toHaveAttribute('class', 'base-popconfirm__header')
		expect(part('title')).toHaveAttribute('class', 'base-popconfirm__title')
		expect(part('actions')).toHaveAttribute('class', 'base-popconfirm__actions')
		expect(panel()).toHaveClass('base-popconfirm__panel')
		expect(document.querySelector('.base-dropdown__arrow')).toHaveClass('base-popconfirm__arrow')
	})

	it('классы частей добавляются к классам кита, customClass сохраняется', () => {
		const ui = Object.fromEntries([
			['root', 'u-root'],
			['panel', 'u-panel'],
			['arrow', 'u-arrow'],
			...PARTS.map(name => [name, `u-${name}`]),
		])
		render(BasePopconfirm, { props: { ...PROPS, ui, customClass: { title: 'own-title', arrow: 'own-arrow' } }, slots: SLOTS })

		expect(screen.getByRole('alertdialog')).toHaveClass('base-popconfirm', 'u-root')
		for (const name of PARTS) expect(part(name)).toHaveClass(`base-popconfirm__${name}`, `u-${name}`)
		expect(part('title')).toHaveClass('own-title')
		expect(panel()).toHaveClass('base-popconfirm__panel', 'u-panel')
		expect(document.querySelector('.base-dropdown__arrow')).toHaveClass('u-arrow', 'own-arrow')
	})

	it('классы из defaults.BasePopconfirm.ui плагина склеиваются с классами экземпляра', () => {
		render(BasePopconfirm, {
			props: { ...PROPS, ui: { actions: 'own-actions' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BasePopconfirm: { ui: { actions: 'app-actions' } } } })] },
		})

		expect(part('actions')).toHaveAttribute('class', 'base-popconfirm__actions app-actions own-actions')
	})
})

describe('BasePopconfirm: анимация', () => {
	it('по умолчанию scale, панель сверху от кнопки', () => {
		render(BasePopconfirm, { props: PROPS, slots: SLOTS })

		expect(panel()).toHaveClass('base-dropdown__panel--animation-scale', 'base-dropdown__panel--side-top')
	})

	it('проп animation уходит в панель', () => {
		render(BasePopconfirm, { props: { ...PROPS, animation: 'pop' }, slots: SLOTS })

		expect(panel()).toHaveClass('base-dropdown__panel--animation-pop')
	})
})

describe('BasePopconfirm: масштаб кнопок', () => {
	const buttonScales = () =>
		[...document.querySelectorAll<HTMLElement>('.base-popconfirm__actions button')].map(button =>
			button.style.getPropertyValue('--size-scale'),
		)

	it('кнопки — 87,5% масштаба компонента', () => {
		render(BasePopconfirm, { props: { ...PROPS, sizeScale: 120 }, slots: SLOTS })

		expect(buttonScales()).toEqual(['1.05', '1.05'])
	})

	it('если 87,5% масштаба дают ровно 100, он закрепляется (100.01), а не «наследовать»', () => {
		render(BasePopconfirm, { props: { ...PROPS, sizeScale: 800 / 7 }, slots: SLOTS })

		expect(buttonScales()).toEqual(['1.0001', '1.0001'])
	})
})
