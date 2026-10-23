import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'Страница настроек из компонентов кита: разделы с описанием слева и полями справа, одна форма BaseForm на',
				'всю страницу и общие кнопки внизу. Поля — BaseInput, BaseTextarea, BaseSelect, BaseSegmented и BaseSwitch,',
				'опасное действие подтверждается BasePopconfirm. На узком экране описание раздела встаёт над полями.',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
