import type meta from '../RadiusShadows.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, staticStorySource, useStorySetup } from '@/stories/helpers'

const RADII = [
	{ name: 'xs', value: '2px', usage: 'Бегунки переключателя и ползунков, полосы прогресса' },
	{ name: 'sm', value: '4px', usage: 'Метки, тултипы, пункты меню, страницы пагинации' },
	{ name: 'md', value: '6px', usage: 'Кнопки, поля, аватары' },
	{ name: 'lg', value: '8px', usage: 'Карточки, меню, алерты, тосты' },
	{ name: 'xl', value: '12px', usage: 'Модальные окна, боковые панели' },
	{ name: '2xl', value: '16px', usage: 'Медиа и обложки' },
	{
		name: 'full',
		value: '9999px',
		usage: 'Только круг по смыслу: радио, спиннер, кольцевой прогресс, круговая диаграмма, цветовой круг',
	},
]

const template = `
	<div class="fnd__grid" style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));">
		<div v-for="item in radii" :key="item.name" class="fnd-box" :style="{ borderRadius: 'var(--rise-radius-' + item.name + ')' }">
			<strong>{{ item.name }} · {{ item.value }}</strong>
			<span>--rise-radius-{{ item.name }}</span>
			<span style="font-family: var(--rise-font-sans); text-align: center; padding: 0 8px;">{{ item.usage }}</span>
		</div>
	</div>
`

export const Radius: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Шкала радиусов. Кнопки, бейджи, метки, вкладки, переключатели и аватары — прямоугольники со скруглёнными углами; `full` оставлен для форм, где круг — смысл (радио, спиннер, кольцевой прогресс, круговая диаграмма, цветовой круг).',
			},
			source: staticStorySource({ template, imports: [], script: `const radii = ${literal(RADII)}` }),
		},
	},
	render: args => ({
		setup: useStorySetup(args, { data: { radii: RADII } }),
		template,
	}),
}
