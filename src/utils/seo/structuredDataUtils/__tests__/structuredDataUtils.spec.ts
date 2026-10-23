import { findMissingFields, isDevelopmentBuild, mergeStructuredData, resolveStructuredUrl, serializeJsonLd } from '../structuredDataUtils'

describe('structuredDataUtils', () => {
	describe('mergeStructuredData', () => {
		it('сливает вложенные объекты, заменяет значения и списки', () => {
			const base = {
				'@type': 'Person',
				name: 'Анна',
				address: { '@type': 'PostalAddress', addressLocality: 'Москва' },
				sameAs: ['a'],
			}
			const merged = mergeStructuredData(base, { jobTitle: 'Дизайнер', address: { postalCode: '101000' }, sameAs: ['b'] })
			expect(merged).toEqual({
				'@type': 'Person',
				name: 'Анна',
				jobTitle: 'Дизайнер',
				address: { '@type': 'PostalAddress', addressLocality: 'Москва', postalCode: '101000' },
				sameAs: ['b'],
			})
		})

		it('null убирает поле, undefined оставляет собранное, исходный объект не меняется', () => {
			const base = { '@type': 'Person', name: 'Анна', image: '/a.png' }
			expect(mergeStructuredData(base, { image: null, name: undefined })).toEqual({ '@type': 'Person', name: 'Анна' })
			expect(base.image).toBe('/a.png')
		})

		it('без своих полей возвращает копию собранных', () => {
			expect(mergeStructuredData({ '@type': 'Place', name: 'Офис' })).toEqual({ '@type': 'Place', name: 'Офис' })
		})

		it('объект заменяет строку целиком', () => {
			expect(mergeStructuredData({ '@type': 'Comment', author: 'Анна' }, { author: { '@type': 'Person', name: 'Анна' } })).toEqual({
				'@type': 'Comment',
				author: { '@type': 'Person', name: 'Анна' },
			})
		})
	})

	describe('findMissingFields', () => {
		it('полная разметка — пустой список', () => {
			expect(findMissingFields({ '@type': 'Person', name: 'Анна' })).toEqual([])
		})

		it('незнакомый тип не проверяется', () => {
			expect(findMissingFields({ '@type': 'Thing' })).toEqual([])
		})

		it('пустые строки и списки считаются отсутствующими', () => {
			expect(findMissingFields({ '@type': 'Place', name: '' })).toEqual(['name'])
			expect(findMissingFields({ '@type': 'BreadcrumbList', itemListElement: [] })).toEqual([
				'itemListElement',
				'itemListElement[].position',
				'itemListElement[].name',
			])
		})

		it('проверяет каждый элемент списка и вложенные поля', () => {
			const faq = {
				'@type': 'FAQPage',
				mainEntity: [
					{ '@type': 'Question', name: 'Доставка?', acceptedAnswer: { '@type': 'Answer', text: 'Да' } },
					{ '@type': 'Question', name: 'Оплата?', acceptedAnswer: { '@type': 'Answer' } },
				],
			}
			expect(findMissingFields(faq)).toEqual(['mainEntity[].acceptedAnswer.text'])
		})

		it('вместо объекта — значение другого типа: поле отсутствует', () => {
			expect(findMissingFields({ '@type': 'Comment', text: 'Спасибо', author: 'Анна', datePublished: '2026-01-01' })).toEqual([
				'author.name',
			])
		})

		it('проверяет вложенные объекты знакомых типов и не повторяет одно поле дважды', () => {
			const page = {
				'@type': 'WebPage',
				comment: [
					{ '@type': 'Comment', text: 'Отлично', datePublished: '2026-09-01', author: { '@type': 'Person', name: 'Анна' } },
					{
						'@type': 'Comment',
						text: 'Согласен',
						author: { '@type': 'Person' },
						comment: [
							{ '@type': 'Comment', text: 'И я', datePublished: '2026-09-02', author: { '@type': 'Person', name: 'Олег' } },
						],
					},
				],
			}
			expect(findMissingFields(page)).toEqual(['comment[].author.name', 'comment[].datePublished'])
		})

		it('из альтернатив достаточно одной', () => {
			const rating = {
				'@type': 'AggregateRating',
				ratingValue: 4.5,
				reviewCount: 12,
				itemReviewed: { '@type': 'Product', name: 'Ноутбук' },
			}
			expect(findMissingFields(rating)).toEqual([])
			expect(findMissingFields({ ...rating, reviewCount: undefined })).toEqual(['ratingCount|reviewCount'])
		})
	})

	describe('serializeJsonLd', () => {
		it('ставит @context первым полем', () => {
			expect(serializeJsonLd({ '@type': 'Person', name: 'Анна' })).toBe(
				'{"@context":"https://schema.org","@type":"Person","name":"Анна"}',
			)
		})

		it('экранирует </script>, & и разделители строк, JSON остаётся тем же', () => {
			const data = { '@type': 'Comment', text: '</script><script>alert(1)</script> & \u2028\u2029' }
			const json = serializeJsonLd(data)
			expect(json).not.toMatch(/[<>&\u2028\u2029]/)
			expect(json).toContain('\\u003c/script\\u003e')
			expect(JSON.parse(json)).toEqual({ '@context': 'https://schema.org', ...data })
		})
	})

	describe('resolveStructuredUrl', () => {
		it('дополняет относительный путь адресом сайта', () => {
			expect(resolveStructuredUrl('/catalog', 'https://example.com')).toBe('https://example.com/catalog')
			expect(resolveStructuredUrl('https://cdn.example.com/a.png', 'https://example.com')).toBe('https://cdn.example.com/a.png')
		})

		it('без адреса сайта или при ошибке оставляет как есть, пустое — undefined', () => {
			expect(resolveStructuredUrl('/catalog')).toBe('/catalog')
			expect(resolveStructuredUrl('/catalog', 'не адрес')).toBe('/catalog')
			expect(resolveStructuredUrl('', 'https://example.com')).toBeUndefined()
			expect(resolveStructuredUrl(undefined)).toBeUndefined()
		})
	})

	describe('isDevelopmentBuild', () => {
		afterEach(() => {
			vi.unstubAllEnvs()
			vi.unstubAllGlobals()
		})

		it('не production — разработка', () => {
			vi.stubEnv('NODE_ENV', 'development')
			expect(isDevelopmentBuild()).toBe(true)
		})

		it('production — не разработка', () => {
			vi.stubEnv('NODE_ENV', 'production')
			expect(isDevelopmentBuild()).toBe(false)
		})

		it('без process (браузер без сборщика) — не разработка', () => {
			vi.stubGlobal('process', undefined)
			expect(isDevelopmentBuild()).toBe(false)
		})
	})
})
