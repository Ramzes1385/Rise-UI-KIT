import type meta from '../RadiusShadows.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const RADII = [
	{ name: 'xs', value: '2px', usage: 'Отметки, мелкие элементы' },
	{ name: 'sm', value: '4px', usage: 'Бейджи, тултипы, пункты меню' },
	{ name: 'md', value: '6px', usage: 'Кнопки, поля, поповеры' },
	{ name: 'lg', value: '8px', usage: 'Карточки, модальные окна, алерты' },
	{ name: 'xl', value: '12px', usage: 'Крупные панели' },
	{ name: '2xl', value: '16px', usage: 'Промо-блоки' },
	{ name: 'full', value: '9999px', usage: 'Переключатели, аватары, пилюли' },
]

const template = `
	<div class="fnd__grid" style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));">
		<div v-for="item in radii" :key="item.name" class="fnd-box" :style="{ borderRadius: 'var(--rise-radius-' + item.name + ')', borderColor: 'var(--rise-border-accented)' }">
			<strong>{{ item.name }} · {{ item.value }}</strong>
			<span>--rise-radius-{{ item.name }}</span>
			<span style="font-family: var(--rise-font-sans); text-align: center; padding: 0 8px;">{{ item.usage }}</span>
		</div>
	</div>
`

export const Radius: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Шкала радиусов.' },
			source: staticStorySource({ template, imports: [], script: `const radii = ${literal(RADII)}` }),
		},
	},
	render: args => ({
		setup: useStorySetup(args, { data: { radii: RADII } }),
		template,
	}),
}
