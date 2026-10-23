import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import BaseColorPicker from '../ui/BaseColorPicker.vue'
import { fireEvent, render } from '@testing-library/vue'
import { COLOR_PICKER_PARTS } from '../types/BaseColorPicker.types'
import type { BaseColorPickerPart } from '../types/BaseColorPicker.types'

const ui = Object.fromEntries([['root', 'u-root'], ...COLOR_PICKER_PARTS.map(part => [part, `u-${part}`])])

function expectParts(parts: readonly BaseColorPickerPart[]): void {
	for (const part of parts) {
		const elements = document.body.querySelectorAll(`.base-color-picker__${part}`)
		expect(elements.length, part).toBeGreaterThan(0)
		elements.forEach(element => expect(element, part).toHaveClass(`u-${part}`))
	}
}

async function open(container: Element): Promise<void> {
	await fireEvent.click(container.querySelector('.base-color-picker__swatch')!)
}

describe('BaseColorPicker: проп ui', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		document.body.innerHTML = ''
	})

	it('все части триггера, панели и групп образцов получают классы ui', async () => {
		vi.stubGlobal(
			'EyeDropper',
			class {
				open = vi.fn()
			},
		)
		const { container } = render(BaseColorPicker, {
			props: {
				modelValue: '#ef4444',
				hasAlpha: true,
				isResettable: true,
				palettes: [{ label: 'Бренд', colors: ['#112233'] }],
				ui,
			},
		})

		expect(container.querySelector('.base-color-picker')).toHaveClass('u-root', 'base-popover')
		await open(container)
		expectParts(COLOR_PICKER_PARTS.filter(part => part !== 'channel-input'))
		await fireEvent.click(document.body.querySelector('.base-color-picker__format:nth-child(2)')!)
		expectParts(['channel-input'])
		expect(document.body.querySelectorAll('.base-color-picker__thumb')).toHaveLength(2)
		expect(document.body.querySelector('.base-color-picker__popover')).toHaveClass('base-dropdown__panel', 'u-popover')
	})

	it('без ui — только класс кита; классы плагина и экземпляра склеиваются', async () => {
		const { container } = render(BaseColorPicker, {
			props: { modelValue: '#ef4444', ui: { preset: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseColorPicker: { ui: { preset: 'app', marker: 'app-marker' } } } })] },
		})

		expect(container.querySelector('.base-color-picker')!.className).not.toMatch(/\b(app|own)\b/)
		await open(container)
		expect(document.body.querySelector('.base-color-picker__marker')).toHaveAttribute('class', 'base-color-picker__marker app-marker')
		expect(document.body.querySelector('.base-color-picker__preset--selected')).toHaveAttribute(
			'class',
			'base-color-picker__preset app own base-color-picker__preset--selected',
		)
	})
})
