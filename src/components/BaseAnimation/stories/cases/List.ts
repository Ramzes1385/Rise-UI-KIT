import { ref } from 'vue'
import type meta from '../BaseAnimation.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAnimation from '../../ui/BaseAnimation.vue'
import { expect, within, waitFor } from 'storybook/test'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const TASKS = ['Подготовить отчёт за май', 'Созвониться с командой', 'Проверить макеты', 'Обновить документацию', 'Отправить счёт клиенту']

const template = `
	<div class="story-stack story-narrow">
		<div class="story-row">
			<BaseButton variant="outline" @click="add">Добавить задачу</BaseButton>
			<BaseButton variant="ghost" @click="removeFirst">Удалить первую</BaseButton>
		</div>
		<BaseAnimation v-bind="args" aria-label="Задачи" style="margin: 0; padding: 0; list-style: none;">
			<li v-for="task in tasks" :key="task" class="story-frame" style="margin-bottom: 8px;">{{ task }}</li>
		</BaseAnimation>
	</div>
`

const script = `
	const TASKS = ${literal(TASKS)}
	const tasks = ref(TASKS.slice(0, 3))

	function add() {
		const next = TASKS.find(task => !tasks.value.includes(task))
		if (next) tasks.value = [...tasks.value, next]
	}

	function removeFirst() {
		tasks.value = tasks.value.slice(1)
	}
`

export const List: StoryObj<typeof meta> = {
	args: { isGroup: true, name: 'list', tag: 'ul' },
	parameters: {
		controls: { include: ['show'] },
		docs: {
			description: {
				story: [
					'Список (`isGroup`, `name="list"`): новые элементы въезжают справа, удалённые уходят вправо, остальные плавно',
					'сдвигаются. У каждого элемента — `key`; элементы — прямые потомки тега `tag`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAnimation', 'BaseButton'], vue: ['ref'], script }),
		},
	},
	render: args => {
		const tasks = ref(TASKS.slice(0, 3))
		const add = (): void => {
			const next = TASKS.find(task => !tasks.value.includes(task))
			if (next) tasks.value = [...tasks.value, next]
		}
		const removeFirst = (): void => {
			tasks.value = tasks.value.slice(1)
		}
		return {
			components: { BaseAnimation, BaseButton },
			setup: useStorySetup(args, { data: { tasks, add, removeFirst } }),
			template,
		}
	},
	play: async ({ canvas, userEvent }) => {
		const list = canvas.getByRole('list', { name: 'Задачи' })
		await expect(within(list).getAllByRole('listitem')).toHaveLength(3)
		await userEvent.click(canvas.getByRole('button', { name: 'Добавить задачу' }))
		await waitFor(() => expect(canvas.getByText('Обновить документацию')).toBeVisible())
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить первую' }))
		await waitFor(() => expect(canvas.queryByText('Подготовить отчёт за май')).not.toBeInTheDocument())
		await expect(within(list).getAllByRole('listitem')).toHaveLength(3)
	},
}
