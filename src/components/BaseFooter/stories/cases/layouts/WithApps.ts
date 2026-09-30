import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseFooter.stories'
import BaseFooter from '../../../ui/BaseFooter.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFooter container-size="lg">
		<template #top>
			<strong>Rise Market в телефоне</strong>
			<p style="margin: 0">Отслеживайте заказы и получайте скидки в приложении.</p>
			<div class="story-row" style="gap: 16px">
				<BaseLink href="#app-store">Скачать в App Store</BaseLink>
				<BaseLink href="#google-play">Скачать в Google Play</BaseLink>
			</div>
		</template>
		<template #start>© 2026 Rise Market</template>
		<template #end>
			<nav aria-label="Соцсети" class="story-row" style="gap: 16px">
				<BaseLink href="#telegram">Telegram</BaseLink>
				<BaseLink href="#vk">ВКонтакте</BaseLink>
				<BaseLink href="#youtube">YouTube</BaseLink>
			</nav>
		</template>
	</BaseFooter>
`

export const WithApps: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Соцсети и приложения: ссылки на магазины приложений в слоте `top`, соцсети — в конце нижней строки.' },
			source: staticStorySource({ template, imports: ['BaseFooter', 'BaseLink'] }),
		},
		controls: { disable: true },
	},
	render: args => ({ components: { BaseFooter, BaseLink }, setup: useStorySetup(args), template }),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Скачать в Google Play' })).toHaveAttribute('href', '#google-play')
		await expect(canvas.getByRole('navigation', { name: 'Соцсети' })).toBeVisible()
	},
}
