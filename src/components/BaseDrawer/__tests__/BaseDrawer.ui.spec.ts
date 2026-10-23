import '@testing-library/jest-dom/vitest'
import { defineComponent, ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseDrawer from '../ui/BaseDrawer.vue'
import { render, screen, waitFor } from '@testing-library/vue'

const PROPS = { isOpen: true, title: 'Фильтры', description: 'Заказы за месяц' }
const SLOTS = { default: '<p>Тело</p>', footer: '<button type="button">Применить</button>' }
const PARTS = ['panel', 'handle', 'header', 'title', 'close', 'description', 'body', 'footer'] as const

const part = (name: string) => document.querySelector(`.base-drawer__${name}`)
const root = () => document.querySelector('.base-drawer') as HTMLElement

describe('BaseDrawer: проп ui', () => {
	it('без ui — классы кита на частях', () => {
		render(BaseDrawer, { props: PROPS, slots: SLOTS })

		expect(root()).toHaveClass('base-drawer', 'base-drawer--bottom')
		expect(part('panel')).toHaveAttribute('class', 'base-drawer__panel base-drawer__panel--bottom')
		expect(part('handle')).toHaveAttribute('class', 'base-drawer__handle')
		expect(part('description')).toHaveAttribute('class', 'base-drawer__description')
		expect(part('title')).toHaveClass('base-text')
		expect(part('close')).toHaveClass('base-button')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(name => [name, `u-${name}`])])
		render(BaseDrawer, { props: { ...PROPS, direction: 'left', customClass: 'own-root', ui }, slots: SLOTS })

		expect(root()).toHaveClass('base-drawer', 'u-root', 'base-drawer--left', 'own-root')
		expect(part('panel')).toHaveClass('base-drawer__panel--left')
		for (const name of PARTS) expect(part(name)).toHaveClass(`base-drawer__${name}`, `u-${name}`)
	})

	it('классы из defaults.BaseDrawer.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseDrawer, {
			props: { ...PROPS, ui: { body: 'own-body' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseDrawer: { ui: { root: 'app-root', body: 'app-body' } } } })] },
		})

		expect(root()).toHaveClass('base-drawer', 'app-root')
		expect(part('body')).toHaveAttribute('class', 'base-drawer__body app-body own-body')
	})
})

describe('BaseDrawer: проп animation', () => {
	it('по умолчанию slide', () => {
		render(BaseDrawer, { props: PROPS })
		expect(root()).toHaveClass('base-drawer--animation-slide')
	})

	it.each(['fade', 'scale', 'pop', 'none'] as const)('animation=%s — модификатор на корне', animation => {
		render(BaseDrawer, { props: { ...PROPS, animation } })
		expect(root()).toHaveClass(`base-drawer--animation-${animation}`)
		expect(root()).not.toHaveClass('base-drawer--animation-slide')
	})

	it('умолчание из defaults.BaseDrawer.animation плагина', () => {
		render(BaseDrawer, {
			props: PROPS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseDrawer: { animation: 'fade' } } })] },
		})
		expect(root()).toHaveClass('base-drawer--animation-fade')
	})

	it('уход идёт классами base-drawer-leave-*', async () => {
		const { rerender } = render(BaseDrawer, { props: PROPS, global: { stubs: { Transition: false } } })
		const opened = root()

		await rerender({ ...PROPS, isOpen: false })

		expect(opened).toHaveClass('base-drawer-leave-active')
		await waitFor(() => expect(document.querySelector('.base-drawer')).toBeNull())
	})
})

describe('BaseDrawer: тема и движение области', () => {
	it('телепортированная панель получает data-rise-motion и data-rise-theme области', async () => {
		const Host = defineComponent({
			components: { BaseDrawer },
			setup: () => ({ isOpen: ref(false) }),
			template: `
				<div data-rise-motion="subtle" data-rise-theme="playful">
					<button type="button" @click="isOpen = true">Открыть</button>
					<BaseDrawer v-model:is-open="isOpen" title="Фильтры" />
				</div>
			`,
		})
		render(Host)

		screen.getByRole('button', { name: 'Открыть' }).click()
		await screen.findByRole('dialog', { name: 'Фильтры' })

		await waitFor(() => expect(root()).toHaveAttribute('data-rise-motion', 'subtle'))
		expect(root()).toHaveAttribute('data-rise-theme', 'playful')
		expect(root().parentElement?.closest('[data-rise-motion]')).toBeNull()
	})
})
