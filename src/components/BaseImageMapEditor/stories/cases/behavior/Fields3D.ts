import { IMAGE_MAP_3D_FIELDS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'
import { expect, waitFor, within } from 'storybook/test'

export const Fields3D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`has3dFields` — поля 3D для BaseImageMap3D (вход `/map3d`) в панели свойств: у объекта — раздел «Объект в 3D» («Высота в 3D», «Узел в модели этажа»),',
					'у этажа — высота и модель GLB (адрес, масштаб, сдвиг, поворот), у карты — «Сцена» (расстояние между этажами, толщина плиты, высота объектов).',
					'Пределы полей — по правилам карты: толщину плиты и масштаб модели меньше 0,01 не ввести (0 не записывается). Неверное значение, которое всё же пришло в поле, — ошибка под полем, JSON не меняется; отмена и импорт снимают ошибки. Пустое поле или узел из одних пробелов — умолчание карты; экспорт JSON сохраняет 3D-поля.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: IMAGE_MAP_3D_FIELDS, has3dFields: true, selected: 'f1-shop-1' },
	play: async ({ canvas, userEvent }) => {
		const object3d = canvas.getByRole('group', { name: 'Объект в 3D' })
		await expect(within(object3d).getByLabelText('Узел в модели этажа')).toHaveValue('Shop_101')
		await expect(canvas.getByRole('group', { name: 'Этаж «Этаж 1»' })).toBeVisible()

		const scene = canvas.getByRole('group', { name: 'Сцена' })
		const thickness = within(scene).getByRole('spinbutton', { name: 'Толщина плиты этажа' })
		await userEvent.click(thickness)
		await expect(thickness).toHaveAttribute('aria-valuemin', '0.01')
		await userEvent.keyboard('0')
		await expect(thickness).not.toHaveAttribute('aria-valuenow')
		await expect(within(scene).queryByText('Ожидается число больше 0')).not.toBeInTheDocument()
		await userEvent.keyboard('{ArrowUp}')
		await waitFor(() => expect(thickness).toHaveAttribute('aria-valuenow', '1'))
	},
}
