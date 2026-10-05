import { expect } from 'storybook/test'
import BaseMap from '../../../ui/BaseMap.vue'
import type meta from '../../BaseMap.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { installDemoYandex } from '../../demoProvider'
import type { MapStatus } from '../../../types/BaseMap.types'
import { literal, storySource, useStorySetup, withJsonLd } from '@/stories/helpers'

const CASES = [
	{ label: 'Без ключа', apiKey: '', provider: 'yandex' },
	{ label: 'Google без Map ID', apiKey: 'demo', provider: 'google' },
	{ label: 'Ошибка загрузки', apiKey: 'demo', provider: 'yandex' },
] as const

const TITLES: Partial<Record<MapStatus, string>> = {
	'no-key': 'Карта появится после настройки ключа',
	'no-map-id': 'Для Google Maps нужен Map ID стиля',
	error: 'Карта не загрузилась — попробуйте позже',
}

const state = { attempt: 0 }

const template = `
	<div class="story-grid" style="--story-grid-min: 260px">
		<BaseMap
			v-for="item in CASES"
			:key="item.label + attempt"
			v-bind="args"
			:api-key="item.apiKey"
			:provider="item.provider"
			:aria-label="item.label">
			<template #placeholder="{ status }">
				<div class="story-col">
					<strong>{{ TITLES[status] }}</strong>
					<span class="story-label">Офис: Москва, Красная площадь, 1 · пн–пт 9:00–18:00</span>
					<BaseButton variant="outline" @click="attempt++">Повторить</BaseButton>
				</div>
			</template>
		</BaseMap>
	</div>
`

export const Placeholder: StoryObj<typeof meta> = {
	decorators: [withJsonLd],
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `placeholder` заменяет штатную заглушку и получает `status`: `no-key` — нет ключа, `no-map-id` — Google без Map ID, `error` — скрипт не загрузился',
					'или ключ отклонён. Приложение показывает здесь адрес, часы работы, кнопку «Повторить» (пересоздаёт карту через `:key`) — что угодно вместо пустого прямоугольника.',
					'SEO-разметка от заглушки не зависит. В превью «ошибка» — демо-поставщик, который отвечает отказом.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseMap'],
				state,
				script: `const CASES = ${literal(CASES)}\n\nconst TITLES = ${literal(TITLES)}`,
			}),
			story: { inline: false, height: '420px' },
		},
		controls: { include: ['variant', 'sizeScale', 'height'] },
	},
	args: { height: '240px', seo: { data: { address: 'Москва, Красная площадь, 1' } } },
	beforeEach: () => installDemoYandex({ isFailing: true }),
	render: args => ({
		components: { BaseButton, BaseMap },
		setup: useStorySetup(args, { state, data: { CASES, TITLES } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('region', { name: 'Без ключа' })).toHaveTextContent('Карта появится после настройки ключа')
		await expect(canvas.getByRole('region', { name: 'Google без Map ID' })).toHaveTextContent('Для Google Maps нужен Map ID стиля')
		const failed = canvas.getByRole('region', { name: 'Ошибка загрузки' })
		await expect(failed).toHaveTextContent('Карта не загрузилась — попробуйте позже')
		await expect(failed).not.toHaveTextContent('Проверьте ключ API')
		await userEvent.click(canvas.getAllByRole('button', { name: 'Повторить' })[2]!)
		await expect(canvas.getByRole('region', { name: 'Ошибка загрузки' })).toHaveTextContent('Карта не загрузилась — попробуйте позже')
		await expect(canvas.getByRole('region', { name: 'Разметка JSON-LD' })).toHaveTextContent('"address": "Москва, Красная площадь, 1"')
	},
}
