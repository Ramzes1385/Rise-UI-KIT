import { expect } from 'storybook/test'
import type meta from '../../BaseHeader.stories'
import BaseHeader from '../../../ui/BaseHeader.vue'
import { BaseButton } from '@components/BaseButton'
import { BaseSearch } from '@components/BaseSearch'
import type { StoryObj } from '@storybook/vue3-vite'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const SEARCH_END_GAP = 64
const WIDE_MIN_WIDTH = 600

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
		const search = canvas.getByRole('combobox', { name: 'Поиск по документации' }).getBoundingClientRect()
		const end = canvas.getByRole('button', { name: 'Войти' }).getBoundingClientRect()
		await expect(end.left - search.right).toBeLessThan(SEARCH_END_GAP)
		if (header.width >= WIDE_MIN_WIDTH) await expect(search.width).toBeGreaterThan(header.width / 2)
	},
}
