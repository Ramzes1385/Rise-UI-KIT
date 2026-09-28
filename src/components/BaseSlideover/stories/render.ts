import { ref } from 'vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseInput } from '@components/BaseInput'
import BaseSlideover from '../ui/BaseSlideover.vue'
import { BaseButton } from '@components/BaseButton'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => {
	const onUpdate = useModelArg('isOpen')
	return {
		components: { BaseSlideover, BaseButton, BaseInput },
		setup: () => ({ props: useArgsWithoutSlots(args), onUpdate, project: ref(''), author: ref('') }),
		template: `
				<BaseButton variant="outline" @click="onUpdate(true)">Открыть фильтры</BaseButton>
				<BaseSlideover v-bind="props" @update:is-open="onUpdate">
					<div class="story-stack">
						<BaseInput v-model="project" label="Проект" placeholder="Название проекта" />
						<BaseInput v-model="author" label="Автор" placeholder="Имя или почта" />
					</div>
					<template #footer>
						<BaseButton variant="outline" @click="onUpdate(false)">Сбросить</BaseButton>
						<BaseButton @click="onUpdate(false)">Применить</BaseButton>
					</template>
				</BaseSlideover>
			`,
	}
}) satisfies Meta<typeof BaseSlideover>['render']
