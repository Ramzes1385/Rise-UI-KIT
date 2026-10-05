import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseCardInput from '../ui/BaseCardInput.vue'
import { field, typeInto } from './cardInputHelpers'
import { CARD_INPUT_PARTS } from '../types/BaseCardInput.types'
import type { BaseCardInputPart } from '../types/BaseCardInput.types'

const ui = Object.fromEntries([['root', 'u-root'], ...CARD_INPUT_PARTS.map(part => [part, `u-${part}`])])

async function renderWithBrand(number: string, props: Record<string, unknown> = {}) {
	const view = render(BaseCardInput, { props: { hasPreview: true, error: 'Ошибка', ui, ...props } })
	await typeInto(field(view.container, 'number'), number)
	return view
}

function partOf(container: Element, part: BaseCardInputPart): Element | null {
	return container.querySelector(`.base-card-input__${part}`)
}

describe('BaseCardInput: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита', async () => {
		const { container } = await renderWithBrand('4242', { label: 'Карта' })
		const icon = new Set<BaseCardInputPart>(['brand-image', 'brand-name'])

		expect(container.querySelector('.base-card-input')).toHaveClass('u-root', 'base-card-input--stacked')
		for (const part of CARD_INPUT_PARTS.filter(part => !icon.has(part))) expect(partOf(container, part), part).toHaveClass(`u-${part}`)
		for (const face of container.querySelectorAll('.base-card-input__face')) expect(face).toHaveClass('u-face')
	})

	it('картинка марки из brandIcons и название марки без значка получают свои классы', async () => {
		const withImage = await renderWithBrand('4242', { brandIcons: { visa: '/visa.svg' } })
		expect(partOf(withImage.container, 'brand-image')).toHaveClass('u-brand-image')
		withImage.unmount()

		const withName = await renderWithBrand('2200')
		expect(partOf(withName.container, 'brand-name')).toHaveClass('u-brand-name')
	})

	it('без ui — только классы кита; классы плагина и экземпляра склеиваются', () => {
		const { container } = render(BaseCardInput, {
			props: { ui: { fields: 'own' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCardInput: { ui: { fields: 'app', number: 'app-number' } } } })] },
		})

		expect(container.querySelector('.base-card-input')!.className).not.toMatch(/app|own/)
		expect(partOf(container, 'number')).toHaveClass('app-number', 'base-input')
		expect(partOf(container, 'fields')).toHaveAttribute('class', 'base-card-input__fields app own')
	})
})
