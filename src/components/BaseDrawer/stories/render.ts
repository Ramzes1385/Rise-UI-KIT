import { ref } from 'vue'
import BaseDrawer from '../ui/BaseDrawer.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { BaseCheckboxGroup } from '@components/BaseCheckboxGroup'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

const STATUSES = [
	{ value: 'new', label: 'Новые' },
	{ value: 'paid', label: 'Оплаченные' },
	{ value: 'shipped', label: 'Отгруженные' },
]

export const render = (args => {
	const onUpdate = useModelArg('isOpen')
	return {
		components: { BaseDrawer, BaseButton, BaseCheckboxGroup },
		setup: () => ({ props: useArgsWithoutSlots(args), onUpdate, statuses: STATUSES, selected: ref(['paid']) }),
		template: `
				<BaseButton variant="outline" @click="onUpdate(true)">Открыть фильтры</BaseButton>
				<BaseDrawer v-bind="props" @update:is-open="onUpdate">
					<BaseCheckboxGroup v-model="selected" :options="statuses" label="Статус" is-vertical />
					<template #footer>
						<BaseButton variant="outline" @click="onUpdate(false)">Сбросить</BaseButton>
						<BaseButton @click="onUpdate(false)">Показать</BaseButton>
					</template>
				</BaseDrawer>
			`,
	}
}) satisfies Meta<typeof BaseDrawer>['render']
