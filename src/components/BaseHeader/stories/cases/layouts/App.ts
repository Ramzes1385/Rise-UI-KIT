import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseHeader.stories'
import BaseHeader from '../../../ui/BaseHeader.vue'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseHeader title="Rise CRM" href="#home" nav-align="start" :is-sticky="false">
		<nav aria-label="Основное" class="story-row" style="gap: 20px">
			<BaseLink href="#orders" aria-current="page">Заказы</BaseLink>
			<BaseLink href="#clients">Клиенты</BaseLink>
			<BaseLink href="#reports">Отчёты</BaseLink>
		</nav>
		<template #end>
			<BaseButton variant="ghost" aria-label="Уведомления"><BaseIcon name="bell" /></BaseButton>
			<BaseAvatar name="Анна Смирнова" />
		</template>
	</BaseHeader>
`

export const App: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Приложение: навигация сразу за названием (`navAlign="start"`), справа — уведомления и профиль.' },
			source: staticStorySource({ template, imports: ['BaseHeader', 'BaseLink', 'BaseButton', 'BaseIcon', 'BaseAvatar'] }),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseHeader, BaseLink, BaseButton, BaseIcon, BaseAvatar },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const title = canvas.getByRole('link', { name: 'Rise CRM' }).getBoundingClientRect()
		const nav = canvas.getByRole('navigation', { name: 'Основное' }).getBoundingClientRect()
		await expect(nav.left - title.right).toBeLessThan(40)
		await expect(canvas.getByRole('button', { name: 'Уведомления' })).toBeVisible()
	},
}
