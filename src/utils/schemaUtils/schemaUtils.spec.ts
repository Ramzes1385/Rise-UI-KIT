import '@testing-library/jest-dom/vitest'
import { buildBreadcrumbsSchema } from './schemaUtils'

describe('schemaUtils', () => {
	describe('buildBreadcrumbsSchema', () => {
		it('строит Schema.org JSON-LD для крошек', () => {
			const result = buildBreadcrumbsSchema([
				{ label: 'Главная', to: '/' },
				{ label: 'Каталог', to: '/catalog' },
			])
			const parsed = JSON.parse(result)
			expect(parsed['@context']).toBe('https://schema.org')
			expect(parsed['@type']).toBe('BreadcrumbList')
			expect(parsed.itemListElement).toHaveLength(2)
		})

		it('устанавливает position начиная с 1', () => {
			const result = buildBreadcrumbsSchema([
				{ label: 'A', to: '/a' },
				{ label: 'B', href: 'https://b.com' },
			])
			const parsed = JSON.parse(result)
			expect(parsed.itemListElement[0].position).toBe(1)
			expect(parsed.itemListElement[1].position).toBe(2)
		})

		it('поддерживает to и href', () => {
			const result = buildBreadcrumbsSchema([
				{ label: 'A', to: '/a' },
				{ label: 'B', href: 'https://b.com' },
			])
			const parsed = JSON.parse(result)
			expect(parsed.itemListElement[0].item).toBe('/a')
			expect(parsed.itemListElement[1].item).toBe('https://b.com')
		})

		it('не добавляет item без to/href', () => {
			const result = buildBreadcrumbsSchema([{ label: 'Текущая' }])
			const parsed = JSON.parse(result)
			expect(parsed.itemListElement[0]).not.toHaveProperty('item')
		})
	})
})
