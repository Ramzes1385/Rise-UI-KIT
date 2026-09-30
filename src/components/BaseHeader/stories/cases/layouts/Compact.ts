import { expect } from 'storybook/test'
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import type meta from '../../BaseHeader.stories'
import BaseHeader from '../../../ui/BaseHeader.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseHeader title="Склад" variant="soft" nav-align="start" is-compact :is-sticky="false">
		<nav aria-label="Основное" class="story-row" style="gap: 16px">
			<BaseLink href="#stock">Остатки</BaseLink>
			<BaseLink href="#arrivals">Поступления</BaseLink>
			<BaseLink href="#moves">Перемещения</BaseLink>
		</nav>
		<template #end>
			<BaseButton variant="ghost" aria-label="Настройки"><BaseIcon name="settings" /></BaseButton>
		</template>
	</BaseHeader>
`

export const Compact: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Компактная (`isCompact`): высота 48px вместо 64px, название кеглем текста — для рабочих экранов и панелей внутри приложения.',
			},
			source: staticStorySource({ template, imports: ['BaseHeader', 'BaseLink', 'BaseButton', 'BaseIcon'] }),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseHeader, BaseLink, BaseButton, BaseIcon },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('banner').getBoundingClientRect().height).toBeLessThanOrEqual(49)
		await expect(canvas.getByRole('button', { name: 'Настройки' })).toBeVisible()
	},
}
