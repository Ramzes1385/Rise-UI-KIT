import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import BaseAccordion from '../ui/BaseAccordion.vue'
import type { BaseAccordionItem } from '../types/BaseAccordion.types'

const ITEMS: BaseAccordionItem[] = [
	{ label: 'Сколько идёт доставка?', content: 'От одного до трёх дней по Москве.' },
	{ label: 'Можно ли вернуть товар?', slot: 'refund', seoAnswer: 'Да, в течение 14 дней.' },
]

const jsonLd = (container: Element) => container.querySelector('script[type="application/ld+json"]')

const readJsonLd = (container: Element) => JSON.parse(jsonLd(container)!.textContent!)

describe('BaseAccordion SEO', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => warnSpy.mockRestore())

	it('без seo разметки нет', () => {
		const { container } = render(BaseAccordion, { props: { items: ITEMS } })
		expect(jsonLd(container)).toBeNull()
	})

	it('seo — FAQPage: вопрос — label, ответ — seoAnswer или content', () => {
		const { container } = render(BaseAccordion, { props: { items: ITEMS, seo: true } })
		expect(readJsonLd(container)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: [
				{ '@type': 'Question', name: ITEMS[0]!.label, acceptedAnswer: { '@type': 'Answer', text: ITEMS[0]!.content } },
				{ '@type': 'Question', name: ITEMS[1]!.label, acceptedAnswer: { '@type': 'Answer', text: 'Да, в течение 14 дней.' } },
			],
		})
		expect(warnSpy).not.toHaveBeenCalled()
	})

	it('пункт без ответа — предупреждение об acceptedAnswer.text', () => {
		render(BaseAccordion, { props: { items: [{ label: 'Вопрос', slot: 'answer' }], seo: true } })
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('mainEntity[].acceptedAnswer.text'))
	})

	it('пустой список — разметки нет', () => {
		const { container } = render(BaseAccordion, { props: { items: [], seo: true } })
		expect(jsonLd(container)).toBeNull()
	})

	it('разметка — первый элемент корня, последний пункт остаётся :last-child', () => {
		const { container } = render(BaseAccordion, { props: { items: ITEMS, seo: true } })
		const root = container.querySelector('.base-accordion')!
		expect(root.firstElementChild).toBe(jsonLd(container))
		expect(root.lastElementChild).toHaveClass('base-accordion__item')
	})
})
