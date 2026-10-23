import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseAccordion from '../ui/BaseAccordion.vue'
import { render, screen } from '@testing-library/vue'
import { ACCORDION_PARTS } from '../types/BaseAccordion.types'
import type { BaseAccordionItem } from '../types/BaseAccordion.types'

const ITEMS: BaseAccordionItem[] = [
	{ label: 'Оплата', description: 'Карта и СБП', icon: 'check', content: 'Картой или через СБП', defaultOpen: true },
	{ label: 'Доставка', content: 'Курьером по городу' },
]

const allUi = Object.fromEntries(['root', ...ACCORDION_PARTS].map(part => [part, `u-${part}`]))

describe('BaseAccordion: проп ui', () => {
	it('без ui — только классы кита', () => {
		const { container } = render(BaseAccordion, { props: { items: ITEMS } })

		expect(container.querySelector('.base-accordion__label')).toHaveAttribute('class', 'base-accordion__label')
		expect(container.querySelector('.base-accordion__header')).toHaveAttribute('class', 'base-accordion__header')
		expect(container.querySelector('.base-accordion__content')).toHaveAttribute('class', 'base-accordion__content')
		expect(container.querySelector('.base-accordion__text')).toHaveAttribute('class', 'base-accordion__text')
		expect(container.querySelector('.base-accordion__title')).toHaveAttribute('class', 'base-accordion__title')
	})

	it('классы всех частей добавляются к классам кита, модификаторы и customClass сохраняются', () => {
		const { container } = render(BaseAccordion, {
			props: { items: ITEMS, variant: 'outline', customClass: { root: 'own-root', header: 'own-header' }, ui: allUi },
		})

		expect(container.querySelector('.base-accordion')).toHaveClass('u-root', 'base-accordion--outline', 'own-root')
		expect(container.querySelector('.base-accordion__header')).toHaveClass('u-header', 'own-header')
		expect(container.querySelector('.base-accordion__item')).toHaveClass('u-item', 'base-accordion__item--open')
		expect(container.querySelector('.base-accordion__collapse')).toHaveClass('u-collapse', 'base-accordion__collapse--open')
		for (const part of ACCORDION_PARTS) expect(container.querySelector(`.base-accordion__${part}`)).toHaveClass(`u-${part}`)
	})

	it('классы из defaults.BaseAccordion.ui плагина склеиваются с классами экземпляра', () => {
		const { container } = render(BaseAccordion, {
			props: { items: ITEMS, ui: { label: 'own-label' } },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseAccordion: { ui: { root: 'app-root', label: 'app-label' } } } })] },
		})

		expect(container.querySelector('.base-accordion')).toHaveClass('base-accordion', 'app-root')
		expect(container.querySelector('.base-accordion__label')).toHaveAttribute('class', 'base-accordion__label app-label own-label')
	})
})

describe('BaseAccordion: движение', () => {
	it('раскрытие и сворачивание — сразу класс конечного состояния, без ожидания transitionend', async () => {
		const { container } = render(BaseAccordion, { props: { items: ITEMS } })
		const panels = container.querySelectorAll('.base-accordion__collapse')

		screen.getByRole('button', { name: 'Доставка' }).click()
		await nextTick()

		expect(panels[1]).toHaveClass('base-accordion__collapse--open')
		expect(panels[1]).not.toHaveAttribute('inert')
		expect(panels[0]).not.toHaveClass('base-accordion__collapse--open')
		expect(panels[0]).toHaveAttribute('inert')
		expect(panels[0]).toHaveAttribute('aria-hidden', 'true')
	})
})
