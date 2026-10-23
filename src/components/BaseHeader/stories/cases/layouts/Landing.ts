import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseHeader.stories'
import BaseHeader from '../../../ui/BaseHeader.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseHeader title="Rise Studio" href="#home" container-size="lg" :is-sticky="false">
		<nav aria-label="Основное" class="story-row" style="gap: 24px">
			<BaseLink href="#product">Продукт</BaseLink>
			<BaseLink href="#pricing">Цены</BaseLink>
			<BaseLink href="#blog">Блог</BaseLink>
			<BaseLink href="#contacts">Контакты</BaseLink>
		</nav>
		<template #end>
			<BaseButton variant="ghost">Войти</BaseButton>
			<BaseButton>Начать бесплатно</BaseButton>
		</template>
	</BaseHeader>
`

export const Landing: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Лендинг: логотип слева, навигация посередине (`navAlign="center"`, по умолчанию), вход и главная кнопка справа; содержимое — в ширину `lg`.',
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
		const nav = canvas.getByRole('navigation', { name: 'Основное' })
		const header = canvas.getByRole('banner').getBoundingClientRect()
		const { left, right } = nav.getBoundingClientRect()
		await expect(Math.abs((left + right) / 2 - (header.left + header.right) / 2)).toBeLessThan(120)
		await expect(canvas.getByRole('button', { name: 'Начать бесплатно' })).toBeVisible()
	},
}
