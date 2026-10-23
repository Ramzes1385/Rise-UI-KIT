import '@testing-library/jest-dom/vitest'
import BaseUser from '../ui/BaseUser.vue'
import { render } from '@testing-library/vue'

const jsonLd = (container: Element) => container.querySelector('script[type="application/ld+json"]')

const readJsonLd = (container: Element) => JSON.parse(jsonLd(container)!.textContent!)

describe('BaseUser SEO', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => warnSpy.mockRestore())

	it('без seo разметки нет', () => {
		const { container } = render(BaseUser, { props: { name: 'Анна Петрова' } })
		expect(jsonLd(container)).toBeNull()
	})

	it('seo — Person: имя, описание, фото и страница; свои поля из data', () => {
		const { container } = render(BaseUser, {
			props: {
				name: 'Анна Петрова',
				description: 'Дизайнер интерфейсов',
				src: '/team/anna.jpg',
				href: 'https://example.com/team/anna',
				seo: { baseUrl: 'https://example.com', data: { jobTitle: 'Ведущий дизайнер' } },
			},
		})
		expect(readJsonLd(container)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'Person',
			name: 'Анна Петрова',
			description: 'Дизайнер интерфейсов',
			image: 'https://example.com/team/anna.jpg',
			url: 'https://example.com/team/anna',
			jobTitle: 'Ведущий дизайнер',
		})
		expect(warnSpy).not.toHaveBeenCalled()
	})

	it('ссылка на маршрут — url из to, без фото поля image нет', () => {
		const { container } = render(BaseUser, { props: { name: 'Анна', to: '/team/anna', seo: true } })
		expect(readJsonLd(container)).toEqual({ '@context': 'https://schema.org', '@type': 'Person', name: 'Анна', url: '/team/anna' })
	})

	it('пустое имя — предупреждение', () => {
		render(BaseUser, { props: { name: '', seo: true } })
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('name'))
	})
})
