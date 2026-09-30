import type { Meta } from '@storybook/vue3-vite'
import { BaseInput } from '@components/BaseInput'
import BaseSlideover from '../ui/BaseSlideover.vue'
import { BaseButton } from '@components/BaseButton'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { project: '', author: '' }

const models = { isOpen: 'isOpen' }

const template = `
	<BaseButton variant="outline" @click="isOpen = true">Открыть фильтры</BaseButton>
	<BaseSlideover v-bind="args" v-model:is-open="isOpen">
		<div class="story-stack">
			<BaseInput v-model="project" label="Проект" placeholder="Название проекта" />
			<BaseInput v-model="author" label="Автор" placeholder="Имя или почта" />
		</div>
		<template #footer>
			<BaseButton variant="outline" @click="isOpen = false">Сбросить</BaseButton>
			<BaseButton @click="isOpen = false">Применить</BaseButton>
		</template>
	</BaseSlideover>
`

export const source = storySource({
	template,
	imports: ['BaseSlideover', 'BaseButton', 'BaseInput'],
	models,
	state,
})

export const render = (args => ({
	components: { BaseSlideover, BaseButton, BaseInput },
	setup: useStorySetup(args, { models, state, slots: ['default'] }),
	template,
})) satisfies Meta<typeof BaseSlideover>['render']
