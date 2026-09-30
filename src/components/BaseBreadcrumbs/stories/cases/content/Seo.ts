import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseBreadcrumbs.stories'
import BaseBreadcrumbs from '../../../ui/BaseBreadcrumbs.vue'
import { storySource, useStorySetup, withJsonLd } from '@/stories/helpers'

const template = `
	<BaseBreadcrumbs v-bind="args" />
`

export const Seo: StoryObj<typeof meta> = {
	args: { seo: { baseUrl: 'https://shop.example.com' } },
	decorators: [withJsonLd],
	parameters: {
		docs: {
			description: {
				story: [
					'`seo` добавляет разметку schema.org `BreadcrumbList` в JSON-LD — под примером она показана так, как её прочитает поисковик.',
					'В разметке — весь путь, даже свёрнутые `maxItems` крошки; у последней крошки (текущей страницы) нет `item`.',
					'`baseUrl` делает адреса абсолютными: Google и Яндекс ждут полные URL. Свои поля — `seo.data`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseBreadcrumbs'], omit: ['linkComponent'] }),
		},
	},
	render: args => ({
		components: { BaseBreadcrumbs },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const script = canvasElement.querySelector('script[type="application/ld+json"]')
		await expect(JSON.parse(script?.textContent ?? '{}')).toMatchObject({
			'@type': 'BreadcrumbList',
			itemListElement: expect.arrayContaining([expect.objectContaining({ position: 2, item: 'https://shop.example.com/catalog' })]),
		})
		await expect(canvas.getByRole('region', { name: 'Разметка JSON-LD' })).toHaveTextContent('"BreadcrumbList"')
	},
}
