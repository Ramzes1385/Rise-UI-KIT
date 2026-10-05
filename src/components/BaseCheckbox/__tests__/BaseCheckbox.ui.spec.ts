import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseCheckbox from '../ui/BaseCheckbox.vue'
import userEvent from '@testing-library/user-event'
import { CHECKBOX_PARTS } from '../types/BaseCheckbox.types'
import { render, screen, waitFor } from '@testing-library/vue'

const PROPS = { modelValue: true, label: 'Согласен', error: 'Нужно согласие' }

function renderToggle(wrapperAttrs = '') {
	const model = ref(false)
	render({
		components: { BaseCheckbox },
		setup: () => ({ model }),
		template: `<div ${wrapperAttrs}><BaseCheckbox v-model="model" label="Согласен" /></div>`,
	})
	return model
}

describe('BaseCheckbox: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, модификаторы и customClass сохраняются', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...CHECKBOX_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseCheckbox, {
			props: { ...PROPS, variant: 'soft', isDisabled: true, customClass: { root: 'own-root', box: 'own-box' }, ui },
		})
		const root = container.querySelector('.base-checkbox')!

		expect(root).toHaveClass('u-root', 'base-checkbox--soft', 'base-checkbox--disabled', 'base-checkbox--error', 'own-root')
		for (const part of CHECKBOX_PARTS) expect(root.querySelector(`.base-checkbox__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-checkbox__box')).toHaveClass('own-box')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseCheckbox, {
			props: { ...PROPS, ui: { box: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCheckbox: { ui: { root: 'app-root', box: 'app' } } } })] },
		})
		const root = container.querySelector('.base-checkbox')!

		expect(root).toHaveClass('base-checkbox', 'app-root')
		expect(root.querySelector('.base-checkbox__wrapper')).toHaveAttribute('class', 'base-checkbox__wrapper')
		expect(root.querySelector('.base-checkbox__box')).toHaveAttribute('class', 'base-checkbox__box app own')
	})
})

describe('BaseCheckbox: появление отметки', () => {
	it('галочка появляется сразу при отметке и уходит после снятия; неотмеченный флажок без отметки', async () => {
		const user = userEvent.setup()
		const model = renderToggle()

		expect(document.querySelector('.base-checkbox__icon')).not.toBeInTheDocument()
		await user.click(screen.getByRole('checkbox', { name: 'Согласен' }))
		expect(model.value).toBe(true)
		expect(document.querySelector('.base-checkbox__icon')).toBeInTheDocument()

		await user.click(screen.getByRole('checkbox', { name: 'Согласен' }))
		expect(model.value).toBe(false)
		await waitFor(() => expect(document.querySelector('.base-checkbox__icon')).not.toBeInTheDocument())
	})

	it('пресет none и prefers-reduced-motion: конечное состояние без ожидания перехода', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
		const user = userEvent.setup()
		renderToggle('data-rise-motion="none"')

		await user.click(screen.getByRole('checkbox', { name: 'Согласен' }))
		expect(document.querySelector('.base-checkbox__icon')).toBeInTheDocument()
		await user.click(screen.getByRole('checkbox', { name: 'Согласен' }))
		await waitFor(() => expect(document.querySelector('.base-checkbox__icon')).not.toBeInTheDocument())
		vi.unstubAllGlobals()
	})

	it('частичная отметка — черта, переход к галочке без повторного появления', async () => {
		const { container, rerender } = render(BaseCheckbox, { props: { modelValue: false, isIndeterminate: true } })
		const mark = container.querySelector('.base-checkbox__icon')

		expect(mark?.querySelector('use')?.getAttribute('href')).toContain('minus')
		await rerender({ modelValue: true, isIndeterminate: false })
		expect(container.querySelector('.base-checkbox__icon')).toBe(mark)
		expect(mark?.querySelector('use')?.getAttribute('href')).toContain('check')
	})
})
