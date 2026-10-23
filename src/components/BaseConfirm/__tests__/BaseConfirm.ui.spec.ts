import '@testing-library/jest-dom/vitest'
import { useConfirm } from '../useConfirm'
import { createUiKitPlugin } from '@/plugin'
import { BaseApp } from '@components/BaseApp'
import { defineComponent, h, ref } from 'vue'
import BaseConfirm from '../ui/BaseConfirm.vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const PROPS = { isOpen: true, title: 'Удалить проект?', description: 'Это необратимо.', confirmLabel: 'Удалить' }

const dialog = () => screen.getByRole('alertdialog', { name: 'Удалить проект?' })
const overlay = () => document.querySelector('.base-modal') as HTMLElement
const button = (name: string) => screen.getByRole('button', { name })

describe('BaseConfirm: проп ui', () => {
	it('без ui — root на окне BaseModal, классы кита на пояснении и кнопках', () => {
		render(BaseConfirm, { props: PROPS })

		expect(dialog()).toHaveAttribute('class', 'base-modal__content base-confirm')
		expect(screen.getByText('Это необратимо.')).toHaveAttribute('class', 'base-confirm__description')
		expect(button('Отмена')).toHaveClass('base-button', 'base-confirm__cancel')
		expect(button('Удалить')).toHaveClass('base-button', 'base-confirm__confirm')
	})

	it('классы частей добавляются к классам кита, customClass сохраняется', () => {
		render(BaseConfirm, {
			props: {
				...PROPS,
				customClass: { root: 'own-overlay', description: 'own-description' },
				ui: { root: 'u-root', description: 'u-description', cancel: 'u-cancel', confirm: 'u-confirm' },
			},
		})

		expect(dialog()).toHaveClass('base-modal__content', 'base-confirm', 'u-root')
		expect(overlay()).toHaveClass('own-overlay')
		expect(screen.getByText('Это необратимо.')).toHaveClass('base-confirm__description', 'u-description', 'own-description')
		expect(button('Отмена')).toHaveClass('base-confirm__cancel', 'u-cancel')
		expect(button('Удалить')).toHaveClass('base-confirm__confirm', 'u-confirm')
	})

	it('классы из defaults.BaseConfirm.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseConfirm, {
			props: { ...PROPS, ui: { description: 'own-description' } },
			global: {
				plugins: [createUiKitPlugin({ defaults: { BaseConfirm: { ui: { root: 'app-root', description: 'app-description' } } } })],
			},
		})

		expect(dialog()).toHaveClass('base-confirm', 'app-root')
		expect(screen.getByText('Это необратимо.')).toHaveAttribute('class', 'base-confirm__description app-description own-description')
	})
})

describe('BaseConfirm: проп animation', () => {
	it('по умолчанию scale — передаётся BaseModal', () => {
		render(BaseConfirm, { props: PROPS })
		expect(overlay()).toHaveClass('base-modal--animation-scale')
	})

	it.each(['fade', 'slide', 'pop', 'none'] as const)('animation=%s передаётся BaseModal', animation => {
		render(BaseConfirm, { props: { ...PROPS, animation } })
		expect(overlay()).toHaveClass(`base-modal--animation-${animation}`)
	})

	it('умолчание из defaults.BaseConfirm.animation плагина', () => {
		render(BaseConfirm, {
			props: PROPS,
			global: { plugins: [createUiKitPlugin({ defaults: { BaseConfirm: { animation: 'fade' } } })] },
		})
		expect(overlay()).toHaveClass('base-modal--animation-fade')
	})

	it('useConfirm передаёт animation и ui из опций', async () => {
		const Page = defineComponent({
			setup() {
				const confirm = useConfirm()
				const open = () => void confirm({ title: 'Удалить проект?', animation: 'pop', ui: { root: 'from-code' } })
				return () => h('button', { type: 'button', onClick: open }, 'Удалить проект')
			},
		})
		render(defineComponent({ render: () => h(BaseApp, null, () => h(Page)) }))

		await fireEvent.click(button('Удалить проект'))

		expect(await screen.findByRole('alertdialog', { name: 'Удалить проект?' })).toHaveClass('base-confirm', 'from-code')
		expect(overlay()).toHaveClass('base-modal--animation-pop')
	})
})

describe('BaseConfirm: тема и движение области', () => {
	it('телепортированное окно получает data-rise-motion и data-rise-theme области', async () => {
		const Host = defineComponent({
			components: { BaseConfirm },
			setup: () => ({ isOpen: ref(false) }),
			template: `
				<div data-rise-motion="expressive" data-rise-theme="playful">
					<button type="button" @click="isOpen = true">Открыть</button>
					<BaseConfirm v-model:is-open="isOpen" title="Удалить проект?" />
				</div>
			`,
		})
		render(Host)

		await fireEvent.click(button('Открыть'))
		await screen.findByRole('alertdialog', { name: 'Удалить проект?' })

		await waitFor(() => expect(overlay()).toHaveAttribute('data-rise-motion', 'expressive'))
		expect(overlay()).toHaveAttribute('data-rise-theme', 'playful')
	})
})
