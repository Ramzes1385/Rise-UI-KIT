import { CASCADE_ITEMS } from '../../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../BaseMegaMenu.stories'

export const MegaMenuDrilldown: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Глубокие каталоги: `drilldown="always"` заменяет каскад заменой списка колонки. Пункт с `children` открывает свой',
					'уровень внутри колонки, над списком — название уровня и кнопка «Назад к …». `drilldown="auto"` включает этот режим',
					'у разделов, где вложенность каталога не меньше `drilldownFrom` (по умолчанию 3), остальные остаются каскадом;',
					'в узком меню (уже `drilldownBelow`) — история «DrilldownByWidth».',
					'Клавиатура: вправо на пункте открывает уровень и ставит фокус на его первый пункт, влево и Escape возвращают на уровень',
					'выше (фокус — на пункт, из которого вошли), вверх и вниз — по ссылкам панели. Новый уровень объявляется скринридеру',
					'(название и число пунктов). При «уменьшить движение» уровни меняются без анимации; в мобильном виде режим не нужен.',
				].join('\n'),
			},
		},
	},
	args: { items: CASCADE_ITEMS, openKey: 'catalog', drilldown: 'always', trigger: 'click' },
	play: async ({ canvas, userEvent }) => {
		const electronics = canvas.getByRole('button', { name: /Электроника/ })
		await expect(electronics).not.toHaveAttribute('aria-expanded')
		await userEvent.click(electronics)
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Телефоны' })).toHaveFocus())
		await expect(canvas.getByRole('button', { name: 'Назад к «Товары»' })).toBeVisible()
		await expect(canvas.getByRole('list', { name: 'Электроника' })).toBeVisible()

		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Смартфоны' })).toHaveFocus())
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Флагманы' })).toHaveFocus())
		await expect(canvas.getByRole('button', { name: 'Назад к «Телефоны»' })).toBeVisible()

		await userEvent.keyboard('{ArrowLeft}')
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Смартфоны' })).toHaveFocus())
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Телефоны' })).toHaveFocus())

		await userEvent.click(canvas.getByRole('button', { name: 'Назад к «Товары»' }))
		await waitFor(() => expect(canvas.getByRole('button', { name: /Электроника/ })).toHaveFocus())
		await expect(canvas.getByRole('button', { name: /Дом и сад/ })).toBeVisible()
	},
}
