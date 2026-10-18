import { vi } from 'vitest'
import type { RoadmapMaterialKind } from '../../types/roadmapData.types'
import { isExternalUrl, materialIconPath, materialKindText, materialMetaText } from '../../model/view/format/roadmapMaterial'

const UNKNOWN = 'unknown' as RoadmapMaterialKind

describe('roadmapMaterial', () => {
	describe('isExternalUrl', () => {
		it('пустая и относительная ссылки не внешние', () => {
			expect(isExternalUrl(undefined)).toBe(false)
			expect(isExternalUrl('')).toBe(false)
			expect(isExternalUrl('/local')).toBe(false)
			expect(isExternalUrl('docs/page')).toBe(false)
		})

		it('абсолютная ссылка на другой источник — внешняя, на тот же — нет', () => {
			expect(isExternalUrl('https://example.org/a', 'https://app.test')).toBe(true)
			expect(isExternalUrl('https://app.test/a', 'https://app.test')).toBe(false)
			expect(isExternalUrl('HTTP://other.test/a', 'https://app.test')).toBe(true)
		})

		it('источник по умолчанию — адрес страницы', () => {
			expect(isExternalUrl(`${location.origin}/page`)).toBe(false)
			expect(isExternalUrl('https://example.org/a')).toBe(true)
		})

		it('без location (сервер) любая абсолютная ссылка внешняя', () => {
			vi.stubGlobal('location', undefined)
			expect(isExternalUrl('https://example.org/a')).toBe(true)
			vi.unstubAllGlobals()
		})
	})

	it.each([
		{ kind: 'doc', text: 'Документация' },
		{ kind: 'article', text: 'Статья' },
		{ kind: 'video', text: 'Видео' },
		{ kind: 'course', text: 'Курс' },
		{ kind: 'book', text: 'Книга' },
		{ kind: 'practice', text: 'Практика' },
		{ kind: 'link', text: 'Ссылка' },
	] as const)('вид $kind называется «$text», у каждого свой значок', ({ kind, text }) => {
		expect(materialKindText(kind)).toBe(text)
		expect(materialIconPath(kind)).toMatch(/^M/)
	})

	it('неизвестный вид — как ссылка', () => {
		expect(materialKindText(UNKNOWN)).toBe('Ссылка')
		expect(materialIconPath(UNKNOWN)).toBe(materialIconPath('link'))
	})

	it('подпись: вид и длительность, если она задана', () => {
		expect(materialMetaText({ title: 'Лекция', kind: 'video', minutes: 30 })).toBe('Видео · 30 мин')
		expect(materialMetaText({ title: 'Лекция', kind: 'video', minutes: 120 })).toBe('Видео · 2 ч')
		expect(materialMetaText({ title: 'Книга', kind: 'book' })).toBe('Книга')
	})
})
