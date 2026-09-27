/**
 * Foundations / Radius & Shadows — скругления и тени.
 */

import type { Meta, StoryObj } from '@storybook/vue3-vite'
import './foundations.scss'

const meta = {
	title: 'Foundations/Radius & Shadows',
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				component: [
					'Все радиусы выводятся из одной базы `--rise-radius` (4px): `md` = ×1.5, `lg` = ×2 и т. д.',
					'Поменяйте базу на `:root`, чтобы сделать интерфейс острее (`2px`) или мягче (`6px`) целиком.',
					'',
					'Где что: контролы (кнопки, поля, пункты меню) — `md`; карточки, модальные окна, алерты — `lg`;',
					'бейджи и тултипы — `sm`; переключатели, аватары, прогресс — `full`.',
				].join('\n'),
			},
		},
	},
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const RADII = [
	{ name: 'xs', value: '2px', usage: 'Отметки, мелкие элементы' },
	{ name: 'sm', value: '4px', usage: 'Бейджи, тултипы, пункты меню' },
	{ name: 'md', value: '6px', usage: 'Кнопки, поля, поповеры' },
	{ name: 'lg', value: '8px', usage: 'Карточки, модальные окна, алерты' },
	{ name: 'xl', value: '12px', usage: 'Крупные панели' },
	{ name: '2xl', value: '16px', usage: 'Промо-блоки' },
	{ name: 'full', value: '9999px', usage: 'Переключатели, аватары, пилюли' },
]

const SHADOWS = [
	{ name: 'xs', usage: 'Поля ввода с вариантом shadow' },
	{ name: 'sm', usage: 'Кнопки shadow, карточки при наведении' },
	{ name: 'md', usage: 'Приподнятые карточки' },
	{ name: 'lg', usage: 'Выпадающие списки, поповеры, тосты' },
	{ name: 'xl', usage: 'Модальные окна, выезжающие панели' },
]

/** Шкала радиусов. */
export const Radius: Story = {
	render: () => ({
		setup: () => ({ radii: RADII }),
		template: `
			<div class="fnd__grid" style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));">
				<div v-for="item in radii" :key="item.name" class="fnd-box" :style="{ borderRadius: 'var(--rise-radius-' + item.name + ')', borderColor: 'var(--rise-border-accented)' }">
					<strong>{{ item.name }} · {{ item.value }}</strong>
					<span>--rise-radius-{{ item.name }}</span>
					<span style="font-family: var(--rise-font-sans); text-align: center; padding: 0 8px;">{{ item.usage }}</span>
				</div>
			</div>
		`,
	}),
}

/** Шкала теней. В тёмной теме тени плотнее, чтобы оставаться заметными на тёмном фоне. */
export const Shadows: Story = {
	render: () => ({
		setup: () => ({ shadows: SHADOWS }),
		template: `
			<div class="fnd__grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 24px; padding: 8px;">
				<div v-for="item in shadows" :key="item.name" class="fnd-box" :style="{ borderRadius: 'var(--rise-radius-lg)', boxShadow: 'var(--rise-shadow-' + item.name + ')' }">
					<strong>{{ item.name }}</strong>
					<span>--rise-shadow-{{ item.name }}</span>
					<span style="font-family: var(--rise-font-sans); text-align: center; padding: 0 8px;">{{ item.usage }}</span>
				</div>
			</div>
		`,
	}),
}
