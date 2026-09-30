import type meta from '../../BaseTabs.stories'
import BaseTabs from '../../../ui/BaseTabs.vue'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { tab: 'modelValue' }

const template = `
	<BaseTabs v-bind="args" v-model="tab">
		<template #panel-overview>
			<p>Лёгкий ноутбук с экраном 13 дюймов и автономностью до 18 часов.</p>
		</template>
		<template #panel-specs>
			<ul>
				<li>Процессор — 8 ядер</li>
				<li>Память — 16 ГБ</li>
				<li>Вес — 1,2 кг</li>
			</ul>
		</template>
		<template #default>
			<p>Раздел пока без своего содержимого.</p>
		</template>
	</BaseTabs>
`

export const PanelSlots: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Содержимое каждой вкладки — своим слотом `panel-<id>`: вкладка `specs` — слот `panel-specs`. Показывается',
					'панель выбранной вкладки; вкладка без своего слота показывает `default`. Роль `tabpanel` и связь с вкладкой — как',
					'у слота по умолчанию.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTabs'], models }),
		},
	},
	render: args => ({
		components: { BaseTabs },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('tabpanel', { name: 'Обзор' })).toHaveTextContent('13 дюймов')
		await userEvent.click(canvas.getByRole('tab', { name: 'Характеристики' }))
		await waitFor(() => expect(canvas.getByRole('tabpanel', { name: 'Характеристики' })).toHaveTextContent('16 ГБ'))
		await userEvent.click(canvas.getByRole('tab', { name: 'Доставка' }))
		await waitFor(() => expect(canvas.getByRole('tabpanel', { name: 'Доставка' })).toHaveTextContent('пока без своего содержимого'))
	},
}
