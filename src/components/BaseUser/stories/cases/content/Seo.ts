import { expect } from 'storybook/test'
import type meta from '../../BaseUser.stories'
import BaseUser from '../../../ui/BaseUser.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup, withJsonLd } from '@/stories/helpers'

const template = `
	<BaseUser v-bind="args" />
`

export const Seo: StoryObj<typeof meta> = {
	args: {
		name: 'Анна Петрова',
		description: 'Дизайнер интерфейсов',
		href: 'https://example.com/team/anna',
		seo: { data: { jobTitle: 'Ведущий дизайнер', worksFor: { '@type': 'Organization', name: 'Rise Studio' } } },
	},
	decorators: [withJsonLd],
	parameters: {
		docs: {
			description: {
				story: [
					'`seo` — разметка schema.org `Person` (JSON-LD): `name`, `description`, фото (`image`) и страница (`url` из `href` или `to`).',
					'Должность, место работы и соцсети (`jobTitle`, `worksFor`, `sameAs`) — в `seo.data`. Под примером — разметка для поисковика.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseUser'] }),
		},
	},
	render: args => ({
		components: { BaseUser },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const script = canvasElement.querySelector('script[type="application/ld+json"]')
		await expect(JSON.parse(script?.textContent ?? '{}')).toMatchObject({
			'@type': 'Person',
			name: 'Анна Петрова',
			url: 'https://example.com/team/anna',
			jobTitle: 'Ведущий дизайнер',
		})
		await expect(canvas.getByRole('region', { name: 'Разметка JSON-LD' })).toHaveTextContent('"Person"')
	},
}
