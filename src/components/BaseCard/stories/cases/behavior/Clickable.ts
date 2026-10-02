import { expect } from 'storybook/test'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const PLANS = [
	{ id: 1, title: 'Старт', subtitle: 'до 3 проектов · бесплатно' },
	{ id: 2, title: 'Команда', subtitle: 'до 20 проектов · 990 ₽ в месяц' },
	{ id: 3, title: 'Компания', subtitle: 'без ограничений · по запросу' },
]

const CONTENT_ARGS = ['default', 'title', 'subtitle', 'isHoverable']

const state = { chosen: '' }

const template = `
	<div class="story-stack">
		<div class="story-grid" style="--story-grid-min: 220px;">
			<BaseCard
				v-for="plan in plans"
				:key="plan.id"
				v-bind="args"
				:title="plan.title"
				:subtitle="plan.subtitle"
				@click="chosen = plan.title" />
		</div>
		<p class="story-label" role="status">{{ chosen ? 'Выбран тариф «' + chosen + '»' : 'Тариф не выбран' }}</p>
	</div>
`

export const Clickable: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Кликабельные карточки: с обработчиком `@click` карточка — кнопка с именем из `title`, фокус с Tab, Enter и Space.',
					'Вид — как у `isHoverable`: курсор, рамка и тень при наведении, кольцо фокуса.',
					'В такой карточке не должно быть своих кнопок и ссылок: для карточки с действиями кнопкой делают заголовок.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCard'],
				state,
				script: `const plans = ${literal(PLANS)}`,
				omit: CONTENT_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: useStorySetup(args, { state, slots: CONTENT_ARGS, data: { plans: PLANS } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const first = canvas.getByRole('button', { name: 'Старт' })
		await tabTo(first, userEvent)
		await expect(getComputedStyle(first).outlineStyle).toBe('solid')
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('status')).toHaveTextContent('Выбран тариф «Старт»')
		await userEvent.tab()
		await userEvent.keyboard(' ')
		await expect(canvas.getByRole('status')).toHaveTextContent('Выбран тариф «Команда»')
	},
}
