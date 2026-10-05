import { NEWS } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseMarquee.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseMarquee from '../../../ui/BaseMarquee.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-marquee', item: 'story-themed-item' }

const template = `
	<div class="story-col">
		<BaseMarquee v-bind="args" :items="news" label="По умолчанию">
			<template #separator>•</template>
		</BaseMarquee>
		<div style="--rise-marquee-bg: var(--rise-bg-inverted); --rise-marquee-text: var(--rise-text-inverted); --rise-marquee-separator-text: var(--rise-text-dimmed); --rise-marquee-radius: var(--rise-radius-full); --rise-marquee-font-size: var(--rise-font-size-base);">
			<BaseMarquee v-bind="args" :items="news" label="Токены на контейнере">
				<template #separator>•</template>
			</BaseMarquee>
		</div>
		<BaseMarquee v-bind="args" :items="news" label="Классы через ui" :ui="ui">
			<template #separator>•</template>
		</BaseMarquee>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['sizeScale', 'speed', 'hasFade'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-marquee-*` кит только читает —',
					'задайте их на `:root`, в теме или на контейнере: `bg`, `text`, `border`, `radius`, `gap` (между лентой и кнопкой паузы),',
					'`padding-x`, `padding-y` (у `soft` и `outline`), `font-size`, `separator-text`, `viewport-height` (высота вертикальной ленты).',
					'Скорость и длительность круга — пропы `speed` и `gap`, а не токены движения. Проп `ui` добавляет классы к частям',
					'(`root`, `viewport`, `track`, `group`, `item`, `separator`, `button`); глобально — `defaults.BaseMarquee.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseMarquee'], script: `const news = ${literal(NEWS)}\nconst ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseMarquee },
		setup: useStorySetup(args, { data: { news: NEWS, ui } }),
		template,
	}),
	play: async ({ canvas }) => {
		const plain = canvas.getByRole('marquee', { name: 'По умолчанию' })
		const themed = canvas.getByRole('marquee', { name: 'Токены на контейнере' })
		const classed = canvas.getByRole('marquee', { name: 'Классы через ui' })

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('9999px')
		await expect(getComputedStyle(themed).fontSize).toBe('16px')
		await expect(getComputedStyle(plain).fontSize).toBe('14px')
		await expect(classed).toHaveClass('base-marquee', 'story-themed-marquee')
		await expect(classed.querySelector('.base-marquee__item')).toHaveClass('story-themed-item')
	},
}
