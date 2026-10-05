import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render, screen } from '@testing-library/vue'
import BaseSplitButton from '../ui/BaseSplitButton.vue'

const ITEMS = [{ label: 'Сохранить как черновик' }]
const PROPS = { label: 'Сохранить', items: ITEMS }

const part = (name: string) => screen.getByRole('group').querySelector(`.base-split-button__${name}`)

describe('BaseSplitButton: проп ui', () => {
	it('без ui — только классы кита (у кнопок — ещё классы BaseButton)', () => {
		render(BaseSplitButton, { props: PROPS })

		expect(screen.getByRole('group')).toHaveAttribute('class', 'base-split-button base-split-button--default')
		expect(part('main')?.className).toMatch(/^base-button .*base-split-button__main$/)
		expect(part('toggle')?.className).toMatch(/^base-button .*base-split-button__toggle$/)
		expect(part('menu')).toHaveClass('base-split-button__menu')
	})

	it('классы частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		render(BaseSplitButton, {
			props: {
				...PROPS,
				variant: 'soft',
				customClass: { root: 'own-root', main: 'own-main', toggle: 'own-toggle' },
				ui: { root: 'u-root', main: 'u-main', menu: 'u-menu', toggle: 'u-toggle' },
			},
		})

		expect(screen.getByRole('group')).toHaveClass('base-split-button', 'u-root', 'base-split-button--soft', 'own-root')
		expect(part('main')).toHaveClass('base-button', 'base-button--soft', 'u-main', 'own-main')
		expect(part('menu')).toHaveClass('u-menu')
		expect(part('toggle')).toHaveClass('base-button', 'u-toggle', 'own-toggle')
	})

	it('кнопка-стрелка без инлайн-отступов: поле задают стили (токен --rise-split-button-toggle-padding-x)', () => {
		render(BaseSplitButton, { props: PROPS })

		expect(part('toggle')?.getAttribute('style') ?? '').not.toContain('--btn-pad')
	})

	it('классы из defaults.BaseSplitButton.ui плагина склеиваются с классами экземпляра', () => {
		render(BaseSplitButton, {
			props: { ...PROPS, ui: { toggle: 'own-toggle' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseSplitButton: { ui: { root: 'app-root', toggle: 'app-toggle' } } } })] },
		})

		expect(screen.getByRole('group')).toHaveClass('base-split-button', 'app-root')
		expect(part('toggle')?.className).toMatch(/base-split-button__toggle app-toggle own-toggle$/)
	})
})
