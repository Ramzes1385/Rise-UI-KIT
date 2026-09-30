import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseHeader.stories'
import BaseHeader from '../../../ui/BaseHeader.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="position: relative">
		<BaseHeader title="Rise Studio" href="#home" variant="ghost" container-size="lg" is-overlay>
			<nav aria-label="Основное" class="story-row" style="gap: 24px">
				<BaseLink href="#product">Продукт</BaseLink>
				<BaseLink href="#pricing">Цены</BaseLink>
			</nav>
			<template #end><BaseButton>Начать бесплатно</BaseButton></template>
		</BaseHeader>
		<section
			aria-labelledby="cover-title"
			style="display: grid; place-content: center; min-height: 360px; padding: 96px 24px 48px; text-align: center; background: linear-gradient(var(--rise-primary-soft), var(--rise-bg))">
			<h1 id="cover-title" style="margin: 0 0 12px">Интерфейсы, которые работают сразу</h1>
			<p style="margin: 0">Шапка лежит поверх обложки и не занимает места.</p>
		</section>
	</div>
`

export const OverCover: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Прозрачная над обложкой: `isOverlay` кладёт шапку поверх следующего блока, `variant="ghost"` убирает фон и линию. Нужен позиционированный предок (`position: relative`), `isSticky` не действует.',
			},
			source: staticStorySource({ template, imports: ['BaseHeader', 'BaseLink', 'BaseButton'] }),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseHeader, BaseLink, BaseButton },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const header = canvas.getByRole('banner').getBoundingClientRect()
		const cover = canvas.getByRole('region', { name: 'Интерфейсы, которые работают сразу' }).getBoundingClientRect()
		await expect(header.top).toBe(cover.top)
	},
}
