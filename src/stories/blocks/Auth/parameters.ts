import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	controls: { disable: true },
	docs: {
		description: {
			component: [
				'Экраны входа и регистрации из компонентов кита: BaseForm со схемой проверки, BaseFormField, BaseInput,',
				'BasePhoneInput, BaseCheckbox, BaseSeparator, BaseLink и BaseButton. Схема здесь написана вручную в формате',
				'Standard Schema — в приложении её обычно задают через Zod или Valibot. Ошибки появляются после первой',
				'отправки, фокус переходит на первое поле с ошибкой. Код экрана — во вкладке «Show code».',
			].join('\n'),
		},
	},
} satisfies Meta['parameters']
