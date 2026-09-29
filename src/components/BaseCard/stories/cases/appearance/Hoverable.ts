import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots, tabTo } from '@/stories/helpers'

const PROJECTS = [
	{ id: 1, title: 'Ребрендинг', subtitle: '12 задач · до 30 мая' },
	{ id: 2, title: 'Мобильное приложение', subtitle: '28 задач · до 15 июня' },
	{ id: 3, title: 'Справочный центр', subtitle: '5 задач · до 1 июня' },
]

export const Hoverable: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Интерактивные карточки: `isHoverable` даёт курсор, рамку и тень при наведении и кольцо фокуса.',
					'Фокус и клавиатуру добавляет приложение: `tabindex="0"`, `role="link"`, обработчики click и Enter.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseCard',
					'  v-for="project in projects"',
					'  :key="project.id"',
					'  is-hoverable',
					'  tabindex="0"',
					'  role="link"',
					'  :title="project.title"',
					'  :subtitle="project.subtitle"',
					'  @click="open(project)"',
					'  @keydown.enter="open(project)" />',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: () => {
			const opened = ref('')
			return { props: useArgsWithoutSlots(args, ['default', 'title', 'subtitle', 'isHoverable']), projects: PROJECTS, opened }
		},
		template: `
			<div class="story-stack">
				<div class="story-grid" style="--story-grid-min: 220px;">
					<BaseCard
						v-for="project in projects"
						:key="project.id"
						v-bind="props"
						is-hoverable
						tabindex="0"
						role="link"
						:title="project.title"
						:subtitle="project.subtitle"
						@click="opened = project.title"
						@keydown.enter="opened = project.title" />
				</div>
				<p class="story-label" role="status">{{ opened ? 'Открыт проект «' + opened + '»' : 'Проект не выбран' }}</p>
			</div>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const [first, second] = canvas.getAllByRole('link')
		await tabTo(first, userEvent)
		await expect(getComputedStyle(first).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('status')).toHaveTextContent('Открыт проект «Ребрендинг»')
		await userEvent.click(second)
		await expect(canvas.getByRole('status')).toHaveTextContent('Открыт проект «Мобильное приложение»')
	},
}
