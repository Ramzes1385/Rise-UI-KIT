import '@testing-library/jest-dom/vitest'
import { defineComponent, ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseSlideover from '../ui/BaseSlideover.vue'
import { render, screen, waitFor } from '@testing-library/vue'

const PROPS = { isOpen: true, title: 'Фильтры' }
const SLOTS = { default: '<p>Тело</p>', footer: '<button type="button">Применить</button>' }
const PARTS = ['panel', 'header', 'title', 'close', 'body', 'footer'] as const

const part = (name: string) => document.querySelector(`.base-slideover__${name}`)
const root = () => document.querySelector('.base-slideover') as HTMLElement

describe('BaseSlideover: проп ui', () => {
	it('без ui — классы кита на частях', () => {
		render(BaseSlideover, { props: PROPS, slots: SLOTS })

		expect(root()).toHaveClass('base-slideover', 'base-slideover--right')
		expect(part('panel')).toHaveAttribute('class', 'base-slideover__panel base-slideover__panel--right')
		expect(part('header')).toHaveAttribute('class', 'base-slideover__header')
		expect(part('footer')).toHaveAttribute('class', 'base-slideover__footer')
		expect(part('title')).toHaveClass('base-text')
		expect(part('close')).toHaveClass('base-button')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...PARTS.map(name => [name, `u-${name}`])])
		render(BaseSlideover, { props: { ...PROPS, side: 'left', customClass: 'own-root', ui }, slots: SLOTS })

		expect(root()).toHaveClass('base-slideover', 'u-root', 'base-slideover--left', 'own-root')
		expect(part('panel')).toHaveClass('base-slideover__panel--left')
		for (const name of PARTS) expect(part(name)).toHaveClass(`base-slideover__${name}`, `u-${name}`)
	})

	it('классы из defaults.BaseSlideover.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseSlideover, {
			props: { ...PROPS, ui: { body: 'own-body' } },
			slots: SLOTS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSlideover: { ui: { root: 'app-root', body: 'app-body' } } } })] },
		})

		expect(root()).toHaveClass('base-slideover', 'app-root')
		expect(part('body')).toHaveAttribute('class', 'base-slideover__body app-body own-body')
	})
})

describe('BaseSlideover: проп animation', () => {
	it('по умолчанию slide', () => {
		render(BaseSlideover, { props: PROPS })
		expect(root()).toHaveClass('base-slideover--animation-slide')
	})

	it.each(['fade', 'scale', 'pop', 'none'] as const)('animation=%s — модификатор на корне', animation => {
		render(BaseSlideover, { props: { ...PROPS, animation } })
		expect(root()).toHaveClass(`base-slideover--animation-${animation}`)
		expect(root()).not.toHaveClass('base-slideover--animation-slide')
	})

	it('умолчание из defaults.BaseSlideover.animation плагина', () => {
		render(BaseSlideover, {
			props: PROPS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSlideover: { animation: 'fade' } } })] },
		})
		expect(root()).toHaveClass('base-slideover--animation-fade')
	})

	it('уход идёт классами base-slideover-leave-*', async () => {
		const { rerender } = render(BaseSlideover, { props: PROPS, global: { stubs: { Transition: false } } })
		const opened = root()

		await rerender({ ...PROPS, isOpen: false })

		expect(opened).toHaveClass('base-slideover-leave-active')
		await waitFor(() => expect(document.querySelector('.base-slideover')).toBeNull())
	})
})

describe('BaseSlideover: тема и движение области', () => {
	it('телепортированная панель получает data-rise-motion и data-rise-theme области', async () => {
		const Host = defineComponent({
			components: { BaseSlideover },
			setup: () => ({ isOpen: ref(false) }),
			template: `
				<div data-rise-motion="subtle" data-rise-theme="playful">
					<button type="button" @click="isOpen = true">Открыть</button>
					<BaseSlideover v-model:is-open="isOpen" title="Фильтры" />
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
