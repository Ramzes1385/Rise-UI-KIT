import { ref, computed } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../../BaseEmpty.stories'
import BaseEmpty from '../../../ui/BaseEmpty.vue'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

const PROJECTS = ['Ребрендинг', 'Мобильное приложение', 'Справочный центр', 'Интеграция с платёжным сервисом']

export const NoResults: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: { story: 'Поиск без результатов: пустое состояние объясняет причину и предлагает сбросить запрос.' },
			source: {
				code: [
					'<BaseEmpty v-if="!results.length" icon="search" title="Ничего не найдено" :description="`По запросу «${query}» проектов нет.`">',
					'  <template #actions><BaseButton variant="outline" @click="query = \'\'">Сбросить поиск</BaseButton></template>',
					'</BaseEmpty>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseEmpty, BaseButton, BaseInput },
		setup: () => {
			const query = ref('Бюджет')
			const results = computed(() => PROJECTS.filter(project => project.toLowerCase().includes(query.value.trim().toLowerCase())))
			return { props: useArgsWithoutSlots(args, ['title', 'description', 'icon']), query, results }
		},
		template: `
			<div class="story-stack story-medium">
				<BaseInput v-model="query" label="Поиск проектов" placeholder="Название проекта" />
				<ul v-if="results.length" aria-label="Проекты" style="margin: 0; padding-left: 20px;">
					<li v-for="project in results" :key="project">{{ project }}</li>
				</ul>
				<BaseEmpty
					v-else
					v-bind="props"
					icon="search"
					title="Ничего не найдено"
					:description="'По запросу «' + query + '» проектов нет. Проверьте написание или сбросьте поиск.'">
					<template #actions>
						<BaseButton variant="outline" @click="query = ''">Сбросить поиск</BaseButton>
					</template>
				</BaseEmpty>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('heading', { name: 'Ничего не найдено' })).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Сбросить поиск' }))
		await expect(canvas.getByRole('list', { name: 'Проекты' }).children).toHaveLength(PROJECTS.length)
		await userEvent.type(canvas.getByLabelText('Поиск проектов'), 'моб')
		await expect(canvas.getByRole('list', { name: 'Проекты' })).toHaveTextContent('Мобильное приложение')
	},
}
