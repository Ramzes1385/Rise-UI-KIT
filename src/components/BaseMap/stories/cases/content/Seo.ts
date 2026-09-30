import { OFFICES } from '../../shared'
import { expect } from 'storybook/test'
import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup, withJsonLd } from '@/stories/helpers'

const template = `
	<BaseMap v-bind="args" />
`

export const Seo: StoryObj<typeof meta> = {
	args: {
		markers: OFFICES.slice(0, 1),
		seo: {
			data: {
				address: { '@type': 'PostalAddress', streetAddress: OFFICES[0]!.title, addressLocality: 'Москва', addressCountry: 'RU' },
				telephone: '+7 800 555-35-35',
			},
		},
	},
	decorators: [withJsonLd],
	parameters: {
		docs: {
			description: {
				story: [
					'`seo` — разметка schema.org `Place` (JSON-LD): одна метка — место с её названием (`title`) и координатами (`geo`);',
					'несколько — место с названием `ariaLabel` и центром `center`, метки — в `containsPlace`. Адрес и телефон — в `seo.data`.',
					'Разметка не зависит от ключа API: она выводится и без загруженной карты.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseMap'] }),
		},
	},
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { slots: [] }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const script = canvasElement.querySelector('script[type="application/ld+json"]')
		await expect(JSON.parse(script?.textContent ?? '{}')).toMatchObject({
			'@type': 'Place',
			name: OFFICES[0]!.title,
			geo: { '@type': 'GeoCoordinates', latitude: OFFICES[0]!.coordinates.lat },
		})
		await expect(canvas.getByRole('region', { name: 'Разметка JSON-LD' })).toHaveTextContent('"PostalAddress"')
	},
}
