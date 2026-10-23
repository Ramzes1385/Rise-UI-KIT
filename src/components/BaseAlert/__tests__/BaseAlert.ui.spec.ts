import '@testing-library/jest-dom/vitest'
import { defineComponent, ref } from 'vue'
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

describe('BaseAlert: уход при закрытии (рецепт Transition base-alert)', () => {
	it('close приходит сразу, алерт сам не скрывается', async () => {
		const { emitted } = render(BaseAlert, { props: PROPS })

		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))

		expect(emitted().close).toHaveLength(1)
		expect(screen.getByRole('status')).toBeInTheDocument()
	})

	it('в <Transition name="base-alert"> с v-if родителя уход идёт классами base-alert-leave-*', async () => {
		const Host = defineComponent({
			components: { BaseAlert },
			setup: () => ({ isOpen: ref(true), props: PROPS }),
			template: '<Transition name="base-alert"><BaseAlert v-if="isOpen" v-bind="props" @close="isOpen = false" /></Transition>',
		})
		render(Host, transitionOn)
		const root = screen.getByRole('status')

		await fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }))

		expect(root).toHaveClass('base-alert-leave-active')
		await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
	})
})
