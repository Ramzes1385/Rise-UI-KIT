import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'
import type { BaseMediaPlayerProps } from '../../types/BaseMediaPlayer.types'

const jsonLd = (container: Element) => container.querySelector('script[type="application/ld+json"]')

const readJsonLd = (container: Element) => JSON.parse(jsonLd(container)!.textContent!)

const renderPlayer = (props: Partial<BaseMediaPlayerProps>) =>
	render(BaseMediaPlayer, { props: { sources: '/media/demo.webm', title: 'Как собрать ноутбук', ...props } })

describe('BaseMediaPlayer SEO', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => warnSpy.mockRestore())

	it('без seo разметки нет', () => {
		const { container } = renderPlayer({})
		expect(jsonLd(container)).toBeNull()
	})

	it('seo — VideoObject: название, обложка и первый источник абсолютными адресами, дата из data', () => {
		const { container } = renderPlayer({
			sources: [
				{ src: '/media/demo-1080.mp4', type: 'video/mp4' },
				{ src: '/media/demo.webm', type: 'video/webm' },
			],
			poster: '/media/poster.jpg',
			seo: { baseUrl: 'https://video.example.com', data: { uploadDate: '2026-09-01', description: 'Пошаговая сборка' } },
		})
		expect(readJsonLd(container)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'VideoObject',
			name: 'Как собрать ноутбук',
			thumbnailUrl: 'https://video.example.com/media/poster.jpg',
			contentUrl: 'https://video.example.com/media/demo-1080.mp4',
			uploadDate: '2026-09-01',
			description: 'Пошаговая сборка',
		})
		expect(warnSpy).not.toHaveBeenCalled()
	})

	it('без обложки и даты — предупреждение о thumbnailUrl и uploadDate', () => {
		renderPlayer({ seo: true })
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('thumbnailUrl, uploadDate'))
	})

	it('mode="audio" — AudioObject', () => {
		const { container } = renderPlayer({ mode: 'audio', seo: true })
		expect(readJsonLd(container)).toMatchObject({ '@type': 'AudioObject', contentUrl: '/media/demo.webm' })
	})

	it('название серии попадает в name, источники — из серии', () => {
		const { container } = renderPlayer({
			seo: true,
			playlists: [
				{ id: 's1', title: 'Сезон 1', episodes: [{ id: 'e1', title: 'Серия 1', sources: '/media/e1.webm', poster: '/e1.jpg' }] },
			],
		})
		expect(readJsonLd(container)).toMatchObject({
			name: 'Как собрать ноутбук. Серия 1',
			contentUrl: '/media/e1.webm',
			thumbnailUrl: '/e1.jpg',
		})
	})
})
