import BaseMap from '../../../../ui/BaseMap.vue'
import type meta from '../../../BaseMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import { ICON_MARKERS, NUMBERED_MARKERS, liveOrDemo } from '../../../shared'
import { literal, storySource, tabTo, useStorySetup, withYandexMapsKey } from '@/stories/helpers'

const template = `
	<div class="story-grid" style="--story-grid-min: 300px">
		<BaseMap v-bind="args" :markers="icons" aria-label="Иконки и размеры" />
		<BaseMap v-bind="args" :markers="numbered" aria-label="Слот marker">
			<template #marker="{ marker }">{{ marker.id }}</template>
		</BaseMap>
	</div>
`

const sizeOf = (marker: HTMLElement): string | undefined => marker.parentElement?.style.getPropertyValue('--base-map-marker-size')

export const MarkerIcons: StoryObj<typeof meta> = {
	decorators: [withYandexMapsKey],
	parameters: {
		docs: {
			description: {
				story: [
					'Вид метки задаёт сама метка. `icon` — имя иконки кита внутри пина, `size` — размер значка в px (по умолчанию 24, умножается на `sizeScale`),',
					'`color` — цвет; подпись `title` остаётся именем кнопки для экранного диктора (первая карта).',
					'Слот `marker` рисует свою разметку вместо пина: внутри кнопки метки только текст и иконки, вложенные кнопки и ссылки нельзя (вторая карта).',
					'С ключом из `.env.local` — Яндекс Карты, без него — демо-поставщик без сети.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseMap'],
				script: `const icons = ${literal(ICON_MARKERS)}\n\nconst numbered = ${literal(NUMBERED_MARKERS)}`,
			}),
			story: { inline: false, height: '420px' },
		},
		controls: { include: ['sizeScale', 'height', 'zoom'] },
	},
	args: { ...liveOrDemo.args, height: '300px', zoom: 12 },
	beforeEach: liveOrDemo.beforeEach,
	render: args => ({
		components: { BaseMap },
		setup: useStorySetup(args, { data: { icons: ICON_MARKERS, numbered: NUMBERED_MARKERS } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const icons = canvas.getByRole('region', { name: 'Иконки и размеры' })
		const slotted = canvas.getByRole('region', { name: 'Слот marker' })
		const office = await waitFor(() => within(icons).getByRole('button', { name: 'Офис' }))
		await expect(office).toHaveClass('base-map__marker--icon')
		await expect(sizeOf(office)).toBe('36px')
		await expect(sizeOf(within(icons).getByRole('button', { name: 'Уведомления' }))).toBe('')
		const stop = await waitFor(() => within(slotted).getByRole('button', { name: 'Остановка 2' }))
		await expect(stop).toHaveClass('base-map__marker--custom')
		await expect(stop).toHaveTextContent('2')
		await tabTo(office, userEvent)
		await expect(office).toHaveFocus()
	},
}
