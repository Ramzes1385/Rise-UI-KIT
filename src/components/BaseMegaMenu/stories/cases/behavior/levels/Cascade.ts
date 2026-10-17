import { inlineKey } from '@/stories/helpers'
import { CASCADE_ITEMS } from '../../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../../BaseMegaMenu.stories'

export const Cascade: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Вложенные уровни: у ссылки колонки поле `children` — подменю раскрывается справа от пункта; если справа не',
					'хватает места — под пунктом, прижат к его правому краю; путь по уровням остаётся виден. Глубина не ограничена. Наведение открывает уровень с теми же `openDelay` и `closeDelay`, что',
					'у разделов, клик — сразу. Клавиатура: вправо открывает уровень и ставит фокус на первый пункт, влево и Escape',
					'закрывают текущий уровень и возвращают фокус на его пункт, вверх и вниз — по пунктам уровня. В мобильном виде',
					'уровни раскрываются списком под пунктом. Для очень глубоких каталогов есть drill-down — история «MegaMenuDrilldown».',
				].join('\n'),
			},
		},
	},
	args: { items: CASCADE_ITEMS, openKey: 'catalog' },
	play: async ({ canvas, userEvent }) => {
		const electronics = canvas.getByRole('button', { name: /Электроника/ })
		await expect(electronics).toHaveAttribute('aria-haspopup', 'true')
		await userEvent.click(electronics)
		await expect(electronics).toHaveAttribute('aria-expanded', 'true')
		const phones = canvas.getByRole('button', { name: 'Телефоны' })
		phones.focus()
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		const smartphones = canvas.getByRole('button', { name: 'Смартфоны' })
		await waitFor(() => expect(smartphones).toHaveFocus())
		await userEvent.keyboard('{ArrowDown}')
		await expect(canvas.getByRole('link', { name: 'Кнопочные' })).toHaveFocus()
		await userEvent.keyboard('{ArrowUp}')
		await expect(smartphones).toHaveFocus()
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Флагманы' })).toHaveFocus())
		await expect(canvas.getByRole('list', { name: 'Смартфоны' })).toBeVisible()
		await userEvent.keyboard(inlineKey('{ArrowLeft}'))
		await expect(smartphones).toHaveFocus()
		await expect(smartphones).toHaveAttribute('aria-expanded', 'false')
		await userEvent.keyboard('{Escape}')
		await expect(phones).toHaveFocus()
		await expect(phones).toHaveAttribute('aria-expanded', 'false')
		await userEvent.keyboard(inlineKey('{ArrowRight}'))
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Смартфоны' })).toBeVisible())
	},
}
