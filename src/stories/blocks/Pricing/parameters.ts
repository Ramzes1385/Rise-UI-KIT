import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'Страница тарифов из компонентов кита: переключатель периода BaseSegmented, карточки BaseCard с BaseBadge,',
				'списки возможностей с BaseIcon, кнопки BaseButton и частые вопросы BaseAccordion. Цены придуманы и зашиты',
				'в историю; сумма форматируется `Intl.NumberFormat`. Код экрана — во вкладке «Show code».',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
