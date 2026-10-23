import type meta from '../../BaseLink.stories'
import BaseLink from '../../../ui/BaseLink.vue'
import { BaseText } from '@components/BaseText'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseText>Вариант default: откройте <BaseLink v-bind="args" variant="default" label="настройки проекта" />, чтобы пригласить участников.</BaseText>
		<nav aria-label="Подвал" class="story-row">
			<BaseLink v-bind="args" variant="ghost" to="/about" label="О студии" />
			<BaseLink v-bind="args" variant="ghost" to="/help" label="Помощь" />
			<BaseLink v-bind="args" variant="ghost" to="/terms" label="Условия" />
		</nav>
	</div>
`

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Варианты: `default` — цвет ссылки и подчёркивание, для ссылок в тексте; `ghost` — цвет окружающего текста,',
					'подчёркивание при наведении, для навигации и списков ссылок (подвал, меню, таблицы).',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseLink', 'BaseText'], omit: ['linkComponent'] }),
		},
		controls: { include: ['sizeScale'] },
	},
	render: args => ({
		components: { BaseLink, BaseText },
		setup: useStorySetup(args),
		template,
	}),
}
