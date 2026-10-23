import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCommentThread.stories'
import BaseCommentThread from '../../../ui/BaseCommentThread.vue'
import { storySource, useStorySetup, withJsonLd } from '@/stories/helpers'

const template = `
	<BaseCommentThread v-bind="args" />
`

export const Seo: StoryObj<typeof meta> = {
	args: {
		isReadonly: true,
		seo: {
			baseUrl: 'https://blog.example.com',
			data: {
				'@type': 'BlogPosting',
				headline: 'Как мы собирали дизайн-систему',
				datePublished: '2026-09-01',
				author: { '@type': 'Person', name: 'Роман' },
			},
		},
	},
	decorators: [withJsonLd],
	parameters: {
		docs: {
			description: {
				story: [
					'`seo` — комментарии в разметке schema.org (JSON-LD): каждый — `Comment` с автором (`Person`), датой',
					'(`datePublished`), лайками (`upvoteCount`) и ответами (`comment`). Контейнер по умолчанию — `WebPage`',
					'с `commentCount`; для статьи замените `@type` на `Article` или `BlogPosting` в `seo.data` и добавьте её поля.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCommentThread'] }),
		},
	},
	render: args => ({
		components: { BaseCommentThread },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const script = canvasElement.querySelector('script[type="application/ld+json"]')
		const data = JSON.parse(script?.textContent ?? '{}')
		await expect(data['@type']).toBe('BlogPosting')
		await expect(data.comment[0]).toMatchObject({ '@type': 'Comment', author: { '@type': 'Person' } })
		await expect(canvas.getByRole('region', { name: 'Разметка JSON-LD' })).toHaveTextContent('"commentCount"')
	},
}
