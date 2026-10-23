import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import BaseRadio from '../ui/BaseRadio.vue'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { RADIO_ITEM_PARTS, RADIO_PARTS } from '../types/BaseRadio.types'

const OPTIONS = [
	{ value: 'card', label: 'Картой' },
	{ value: 'cash', label: 'Наличными' },
]
const PROPS = { modelValue: 'card', options: OPTIONS, name: 'pay', label: 'Оплата', isRequired: true, error: 'Выберите способ' }
const GROUP_PARTS = RADIO_PARTS.filter(part => !(RADIO_ITEM_PARTS as readonly string[]).includes(part))
const ITEM_ELEMENTS = RADIO_ITEM_PARTS.filter(part => part !== 'item')

function renderToggle(wrapperAttrs = '') {
	const model = ref<string | number>('card')
	render({
		components: { BaseRadio },
		setup: () => ({ model, options: OPTIONS }),
		template: `<div ${wrapperAttrs}><BaseRadio v-model="model" name="pay" aria-label="Оплата" :options="options" /></div>`,
	})
	return model
}

describe('BaseRadio: проп ui', () => {
	it('классы частей группы и пункта добавляются к БЭМ-классам кита, customClass сохраняется', () => {
		const ui = Object.fromEntries([['root', 'u-root'], ...RADIO_PARTS.map(part => [part, `u-${part}`])])
		const { container } = render(BaseRadio, {
			props: { ...PROPS, variant: 'bordered', customClass: { root: 'own-root', dot: 'own-dot' }, ui },
		})
		const root = container.querySelector('.base-radio')!

		expect(root).toHaveClass('u-root', 'base-radio--bordered', 'base-radio--error', 'own-root')
		for (const part of GROUP_PARTS) expect(root.querySelector(`.base-radio__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-radio-item')).toHaveClass('u-item', 'base-radio-item--error')
		for (const part of ITEM_ELEMENTS) expect(root.querySelector(`.base-radio-item__${part}`)).toHaveClass(`u-${part}`)
		expect(root.querySelector('.base-radio-item__dot')).toHaveClass('own-dot')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseRadio, {
			props: { ...PROPS, error: '', ui: { dot: 'own', options: 'own-options' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseRadio: { ui: { root: 'app-root', dot: 'app' } } } })] },
		})
		const root = container.querySelector('.base-radio')!

		expect(root).toHaveClass('base-radio', 'app-root')
		expect(root.querySelector('.base-radio-item')).toHaveAttribute('class', 'base-radio-item')
		expect(root.querySelector('.base-radio-item__circle')).toHaveAttribute('class', 'base-radio-item__circle')
		expect(root.querySelector('.base-radio-item__dot')).toHaveAttribute('class', 'base-radio-item__dot app own')
		expect(root.querySelector('.base-radio__options')).toHaveAttribute('class', 'base-radio__options own-options')
	})
})

describe('BaseRadio: появление точки', () => {
	it('точка появляется у нового выбора сразу, у прежнего уходит; невыбранный пункт без точки', async () => {
		const user = userEvent.setup()
		const model = renderToggle()
		const circles = () => document.querySelectorAll('.base-radio-item__circle')

		expect(circles()[0]!.querySelector('.base-radio-item__dot')).toBeInTheDocument()
		expect(circles()[1]!.querySelector('.base-radio-item__dot')).not.toBeInTheDocument()
		await user.click(screen.getByRole('radio', { name: 'Наличными' }))

		expect(model.value).toBe('cash')
		expect(circles()[1]!.querySelector('.base-radio-item__dot')).toBeInTheDocument()
		await waitFor(() => expect(circles()[0]!.querySelector('.base-radio-item__dot')).not.toBeInTheDocument())
	})

	it('пресет none и prefers-reduced-motion: конечное состояние без ожидания перехода', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
		)
		const user = userEvent.setup()
		renderToggle('data-rise-motion="none"')

		await user.click(screen.getByRole('radio', { name: 'Наличными' }))
		await waitFor(() => expect(document.querySelectorAll('.base-radio-item__dot')).toHaveLength(1))
		expect(document.querySelectorAll('.base-radio-item__circle')[1]!.querySelector('.base-radio-item__dot')).toBeInTheDocument()
		vi.unstubAllGlobals()
	})
})
