import { IMAGE_MAP_MALL } from '../../fixtures'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseImageMap from '../../../ui/BaseImageMap.vue'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { search: 'search' } as const

const template = `
	<BaseImageMap v-bind="args" v-model:search="search">
		<template #directory-item="{ object, group, isActive }">
			<span>
				<strong>{{ object.title }}</strong>
				<small v-if="group"> — {{ group.title }}</small>
				<span v-if="isActive"> ✓</span>
			</span>
		</template>
		<template #directory-empty>
			<p>По запросу «{{ search }}» ничего нет. Спросите на справочной у входа.</p>
		</template>
	</BaseImageMap>
`

export const DirectoryEmpty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Поиск без результатов: строка статуса «Ничего не найдено», вместо «Ничего не найдено» в списке — слот `directory-empty`. Слот `directory-item` заменяет содержимое строки (`object`, `group`, `isActive`); сама строка-кнопка и её поведение остаются.',
			},
			source: storySource({ template, imports: ['BaseImageMap'], models: MODELS, types: { search: 'string' } }),
		},
	},
	args: { data: IMAGE_MAP_MALL, hasDirectory: true, hasFilters: false, search: 'суши' },
	render: args => ({
		components: { BaseImageMap },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const list = within(canvas.getByRole('complementary', { name: 'Список объектов' }))
		await expect(list.getByRole('status')).toHaveTextContent('Ничего не найдено')
		await expect(list.getByText('По запросу «суши» ничего нет. Спросите на справочной у входа.')).toBeVisible()
		await expect(list.queryAllByRole('listitem')).toHaveLength(0)
		const field = list.getByRole('textbox', { name: 'Поиск по карте' })
		await tabTo(field, userEvent)
		await userEvent.keyboard('{Control>}a{/Control}кофе')
		await waitFor(() => expect(list.getAllByRole('listitem')).toHaveLength(6))
		await expect(await canvas.findByRole('button', { name: /^Магазин 102\s*—\s*Кафе и рестораны$/ })).toBeVisible()
	},
}
