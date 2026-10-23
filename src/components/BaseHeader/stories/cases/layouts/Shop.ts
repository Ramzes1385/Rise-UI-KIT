import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseHeader.stories'
import { BaseBadge } from '@components/BaseBadge'
import BaseHeader from '../../../ui/BaseHeader.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseHeader title="Rise Market" href="#home" container-size="xl" :is-sticky="false">
		<nav aria-label="Магазин" class="story-row" style="gap: 20px">
			<BaseLink href="#sale">Акции</BaseLink>
			<BaseLink href="#delivery">Доставка</BaseLink>
			<BaseLink href="#stores">Магазины</BaseLink>
		</nav>
		<template #end>
			<BaseButton variant="ghost">Войти</BaseButton>
			<BaseButton variant="outline">Корзина <BaseBadge label="3" /></BaseButton>
		</template>
		<template #bottom>
			<nav aria-label="Категории" class="story-row" style="gap: 20px; flex-wrap: wrap">
				<BaseLink href="#phones">Смартфоны</BaseLink>
				<BaseLink href="#laptops">Ноутбуки</BaseLink>
				<BaseLink href="#tv">Телевизоры</BaseLink>
				<BaseLink href="#audio">Наушники и колонки</BaseLink>
				<BaseLink href="#home-appliances">Техника для дома</BaseLink>
			</nav>
		</template>
	</BaseHeader>
`

export const Shop: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Магазин: разделы посередине, вход и корзина справа, категории — вторым рядом в слоте `bottom`. Второй ряд остаётся на узком экране и переносится по строкам.',
			},
			source: staticStorySource({ template, imports: ['BaseHeader', 'BaseLink', 'BaseButton', 'BaseBadge'] }),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseHeader, BaseLink, BaseButton, BaseBadge },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const header = canvas.getByRole('banner')
		const categories = canvas.getByRole('navigation', { name: 'Категории' })
		await expect(header).toContainElement(categories)
		await expect(categories.getBoundingClientRect().top).toBeGreaterThan(
			canvas.getByRole('navigation', { name: 'Магазин' }).getBoundingClientRect().bottom,
		)
		await expect(canvas.getByRole('button', { name: 'Корзина 3' })).toBeVisible()
	},
}
