import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import { render } from '@testing-library/vue'
import BaseCommentThread from '../ui/BaseCommentThread.vue'
import type { CommentItem } from '../types/BaseCommentThread.types'

const jsonLd = (container: Element) => container.querySelector('script[type="application/ld+json"]')

const readJsonLd = (container: Element) => JSON.parse(jsonLd(container)!.textContent!)

const COMMENTS: CommentItem[] = [
	{
		id: '1',
		author: { name: 'Анна', avatar: '/avatars/anna.jpg' },
		text: 'Отличная статья',
		date: '2026-09-01T10:00:00Z',
		likes: 4,
		replies: [{ id: '2', author: { name: 'Олег' }, text: 'Согласен', date: new Date('2026-09-01T11:00:00Z') }],
	},
]

describe('BaseCommentThread SEO', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
	})

	afterEach(() => warnSpy.mockRestore())

	it('без seo разметки нет', () => {
		const { container } = render(BaseCommentThread, { props: { comments: COMMENTS } })
		expect(jsonLd(container)).toBeNull()
	})

	it('seo — страница с комментариями: Comment с автором, датой, лайками и ответами', () => {
		const { container } = render(BaseCommentThread, {
			props: { comments: COMMENTS, seo: { baseUrl: 'https://example.com', data: { '@type': 'BlogPosting', headline: 'Статья' } } },
		})
		expect(readJsonLd(container)).toEqual({
			'@context': 'https://schema.org',
			'@type': 'BlogPosting',
			headline: 'Статья',
			commentCount: 2,
			comment: [
				{
					'@type': 'Comment',
					text: 'Отличная статья',
					datePublished: '2026-09-01T10:00:00.000Z',
					author: { '@type': 'Person', name: 'Анна', image: 'https://example.com/avatars/anna.jpg' },
					upvoteCount: 4,
					comment: [
						{
							'@type': 'Comment',
							text: 'Согласен',
							datePublished: '2026-09-01T11:00:00.000Z',
							author: { '@type': 'Person', name: 'Олег' },
						},
					],
				},
			],
		})
		expect(warnSpy).not.toHaveBeenCalled()
	})

	it('комментарий без имени автора — предупреждение', () => {
		const comments: CommentItem[] = [{ id: '1', author: { name: '' }, text: 'Привет', date: 0 }]
		render(BaseCommentThread, { props: { comments, seo: true } })
		expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('comment[].author.name'))
	})

	it('</script> в тексте комментария не закрывает тег', () => {
		const comments: CommentItem[] = [{ id: '1', author: { name: 'Анна' }, text: '</script><b>x</b>', date: 0 }]
		const { container } = render(BaseCommentThread, { props: { comments, seo: true, isReadonly: true } })
		expect(jsonLd(container)!.innerHTML).not.toContain('</script>')
		expect(readJsonLd(container).comment[0].text).toBe('</script><b>x</b>')
	})

	it('без комментариев разметки нет', () => {
		const { container } = render(BaseCommentThread, { props: { comments: [], seo: true } })
		expect(jsonLd(container)).toBeNull()
	})

	it('seo из createUiKitPlugin({ defaults }) включает разметку без пропа', () => {
		const { container } = render(BaseCommentThread, {
			props: { comments: COMMENTS },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCommentThread: { seo: { data: { name: 'Обсуждение' } } } } })] },
		})
		expect(readJsonLd(container)).toMatchObject({ '@type': 'WebPage', name: 'Обсуждение', commentCount: 2 })
	})

	it('проп seo важнее настройки плагина', () => {
		const { container } = render(BaseCommentThread, {
			props: { comments: COMMENTS, seo: false },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseCommentThread: { seo: true } } })] },
		})
		expect(jsonLd(container)).toBeNull()
	})
})
