import BaseDrawer from '../ui/BaseDrawer.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { BaseCheckboxGroup } from '@components/BaseCheckboxGroup'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const STATUSES = [
	{ value: 'new', label: 'Новые' },
	{ value: 'paid', label: 'Оплаченные' },
	{ value: 'shipped', label: 'Отгруженные' },
]

const statuses = STATUSES

const state = { selected: ['paid'] }

const models = { isOpen: 'isOpen' }

const template = `
	<BaseButton variant="outline" @click="isOpen = true">Открыть фильтры</BaseButton>
	<BaseDrawer v-bind="args" v-model:is-open="isOpen">
		<BaseCheckboxGroup v-model="selected" :options="statuses" label="Статус" is-vertical />
		<template #footer>
			<BaseButton variant="outline" @click="isOpen = false">Сбросить</BaseButton>
			<BaseButton @click="isOpen = false">Показать</BaseButton>
		</template>
	</BaseDrawer>
`

export const source = storySource({
	template,
	imports: ['BaseDrawer', 'BaseButton', 'BaseCheckboxGroup'],
	models,
	script: `const statuses = ${literal(statuses)}`,
	state,
})

export const render = (args => ({
	components: { BaseDrawer, BaseButton, BaseCheckboxGroup },
	setup: useStorySetup(args, { models, state, data: { statuses }, slots: ['default'] }),
	template,
})) satisfies Meta<typeof BaseDrawer>['render']
