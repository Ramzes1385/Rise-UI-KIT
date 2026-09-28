import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
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
} satisfies Meta['parameters']
