import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const PROJECTS = [
	{ id: 1, title: 'Ребрендинг', subtitle: '12 задач · до 30 мая' },
	{ id: 2, title: 'Мобильное приложение', subtitle: '28 задач · до 15 июня' },
	{ id: 3, title: 'Справочный центр', subtitle: '5 задач · до 1 июня' },
]

const CONTENT_ARGS = ['default', 'title', 'subtitle', 'isHoverable']

const template = `
	<div class="story-stack">
		<div class="story-grid" style="--story-grid-min: 220px;">
			<BaseCard
				v-for="project in projects"
				:key="project.id"
				v-bind="args"
				is-hoverable
				:title="project.title"
				:subtitle="project.subtitle"
				@click="opened = project.title" />
		</div>
		<p class="story-label" role="status">{{ opened ? 'Открыт проект «' + opened + '»' : 'Проект не выбран' }}</p>
	</div>
`

export const Hoverable: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Интерактивные карточки: `isHoverable` даёт курсор, рамку, тень и подъём при наведении и кольцо фокуса.',
					'Фокус и клавиатуру даёт обработчик `@click`: карточка становится кнопкой с именем из `title`, Enter и Space вызывают `click`.',
					'`isHoverable` без обработчика — только вид.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCard'],
				vue: ['ref'],
				script: `const projects = ${literal(PROJECTS)}\nconst opened = ref('')`,
				omit: CONTENT_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: useStorySetup(args, { slots: CONTENT_ARGS, data: { projects: PROJECTS, opened: ref('') } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const [first, second] = canvas.getAllByRole('button')
		await tabTo(first, userEvent)
		await expect(getComputedStyle(first).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('status')).toHaveTextContent('Открыт проект «Ребрендинг»')
		await userEvent.click(second)
		await expect(canvas.getByRole('status')).toHaveTextContent('Открыт проект «Мобильное приложение»')
	},
}
