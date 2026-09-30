import { expect } from 'storybook/test'
import type meta from '../../BaseImage.stories'
import BaseImage from '../../../ui/BaseImage.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup, withJsonLd } from '@/stories/helpers'

const template = `
	<BaseImage v-bind="args" />
`

export const Seo: StoryObj<typeof meta> = {
	args: { seo: { data: { creditText: 'Rise Studio', copyrightNotice: '© 2026 Rise Studio', license: 'https://example.com/license' } } },
	decorators: [withJsonLd],
	parameters: {
		docs: {
			description: {
				story: [
					'`seo` — разметка schema.org `ImageObject` (JSON-LD): адрес картинки (`contentUrl`) и подпись из `alt` (`caption`).',
					'Чтобы Google показал в поиске по картинкам автора и лицензию, в `seo.data` нужен хотя бы один из `creator`,',
					'`creditText`, `copyrightNotice`, `license` — без них в разработке будет предупреждение.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseImage'] }),
		},
	},
	render: args => ({
		components: { BaseImage },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const script = canvasElement.querySelector('script[type="application/ld+json"]')
		await expect(JSON.parse(script?.textContent ?? '{}')).toMatchObject({
			'@type': 'ImageObject',
			caption: 'Горы на рассвете',
			creditText: 'Rise Studio',
		})
		await expect(canvas.getByRole('region', { name: 'Разметка JSON-LD' })).toHaveTextContent(
			/"contentUrl": "data:image\/svg\+xml[^"]*,…"/,
		)
	},
}
