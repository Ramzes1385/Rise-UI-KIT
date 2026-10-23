import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseMediaPlayer.stories'
import BaseMediaPlayer from '../../../ui/BaseMediaPlayer.vue'
import { storySource, useStorySetup, withJsonLd } from '@/stories/helpers'

const template = `
	<BaseMediaPlayer v-bind="args" />
`

export const Seo: StoryObj<typeof meta> = {
	args: {
		seo: {
			baseUrl: 'https://video.example.com',
			data: { description: 'Как устроен плеер Rise UI Kit: панель, главы, субтитры', uploadDate: '2026-09-01', duration: 'PT1M' },
		},
	},
	decorators: [withJsonLd],
	parameters: {
		docs: {
			description: {
				story: [
					'`seo` — разметка schema.org `VideoObject` (при `mode="audio"` — `AudioObject`) в JSON-LD: `name` — название',
					'(и серия), `thumbnailUrl` — обложка `poster`, `contentUrl` — первый источник. Google требует ещё `uploadDate`,',
					'а для видео в выдаче желательны `description` и `duration` (ISO 8601) — их компонент не знает, они в `seo.data`.',
				].join('\n'),
			},
			source: storySource({ template, imports: [], importsFrom: { '@ramzes1385/rise-ui-kit/media': ['BaseMediaPlayer'] } }),
		},
	},
	render: args => ({
		components: { BaseMediaPlayer },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const script = canvasElement.querySelector('script[type="application/ld+json"]')
		const data = JSON.parse(script?.textContent ?? '{}')
		await expect(data).toMatchObject({ '@type': 'VideoObject', name: 'Демо-ролик Rise UI Kit', uploadDate: '2026-09-01' })
		await expect(data.thumbnailUrl).toMatch(/^https?:\/\//)
		await expect(canvas.getByRole('region', { name: 'Разметка JSON-LD' })).toHaveTextContent('"VideoObject"')
	},
}
