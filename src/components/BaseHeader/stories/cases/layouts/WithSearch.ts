import { expect } from 'storybook/test'
import type meta from '../../BaseHeader.stories'
import BaseHeader from '../../../ui/BaseHeader.vue'
import { BaseButton } from '@components/BaseButton'
import { BaseSearch } from '@components/BaseSearch'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseHeader title="Rise Docs" href="#home" nav-align="stretch" :is-sticky="false">
		<BaseSearch placeholder="Поиск по документации" />
		<template #end>
			<BaseButton variant="ghost">Войти</BaseButton>
		</template>
	</BaseHeader>
`

export const WithSearch: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'С поиском: поле занимает всё место между названием и действиями (`navAlign="stretch"`) — документация, каталог, почта.',
			},
			source: staticStorySource({ template, imports: ['BaseHeader', 'BaseSearch', 'BaseButton'] }),
		},
		controls: { disable: true },
	},
	render: args => ({
		components: { BaseHeader, BaseSearch, BaseButton },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		const header = canvas.getByRole('banner').getBoundingClientRect()
		const search = canvas.getByRole('combobox', { name: 'Поиск по документации' })
		await expect(search.getBoundingClientRect().width).toBeGreaterThan(header.width / 2)
	},
}
