import type meta from '../RadiusShadows.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const SHADOWS = [
	{ name: 'xs', usage: 'Поля ввода с вариантом shadow' },
	{ name: 'sm', usage: 'Кнопки shadow, карточки при наведении' },
	{ name: 'md', usage: 'Приподнятые карточки' },
	{ name: 'lg', usage: 'Выпадающие списки, поповеры, тосты' },
	{ name: 'xl', usage: 'Модальные окна, выезжающие панели' },
]

const template = `
	<div class="fnd__grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 24px; padding: 8px;">
		<div v-for="item in shadows" :key="item.name" class="fnd-box" :style="{ borderRadius: 'var(--rise-radius-lg)', boxShadow: 'var(--rise-shadow-' + item.name + ')' }">
			<strong>{{ item.name }}</strong>
			<span>--rise-shadow-{{ item.name }}</span>
			<span style="font-family: var(--rise-font-sans); text-align: center; padding: 0 8px;">{{ item.usage }}</span>
		</div>
	</div>
`

export const Shadows: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Шкала теней. В тёмной теме тени плотнее, чтобы оставаться заметными на тёмном фоне.' },
			source: staticStorySource({ template, imports: [], script: `const shadows = ${literal(SHADOWS)}` }),
		},
	},
	render: args => ({
		setup: useStorySetup(args, { data: { shadows: SHADOWS } }),
		template,
	}),
}
