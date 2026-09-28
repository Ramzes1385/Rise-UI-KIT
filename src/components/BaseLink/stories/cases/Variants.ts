import type meta from '../BaseLink.stories'
import BaseLink from '../../ui/BaseLink.vue'
import { BaseText } from '@components/BaseText'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Варианты: `default` — цвет ссылки и подчёркивание, для ссылок в тексте; `ghost` — цвет окружающего текста,',
					'подчёркивание при наведении, для навигации и списков ссылок (подвал, меню, таблицы).',
				].join('\n'),
			},
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseLink, BaseText },
		setup: () => ({ props: useArgsWithoutSlots(args) }),
		template: `
			<div class="story-stack">
				<BaseText>Вариант default: откройте <BaseLink v-bind="props" variant="default" label="настройки проекта" />, чтобы пригласить участников.</BaseText>
				<nav aria-label="Подвал" class="story-row">
					<BaseLink v-bind="props" variant="ghost" to="/about" label="О студии" />
					<BaseLink v-bind="props" variant="ghost" to="/help" label="Помощь" />
					<BaseLink v-bind="props" variant="ghost" to="/terms" label="Условия" />
				</nav>
			</div>
		`,
	}),
}
