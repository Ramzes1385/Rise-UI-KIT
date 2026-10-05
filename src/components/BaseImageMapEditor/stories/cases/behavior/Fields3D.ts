import { expect, within } from 'storybook/test'
import { IMAGE_MAP_3D_FIELDS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'

export const Fields3D: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`has3dFields` — поля 3D для BaseImageMap3D (вход `/map3d`) в панели свойств: у объекта — «Высота в 3D» и «Узел в модели этажа»,',
					'у этажа — высота и модель GLB (адрес, масштаб, сдвиг, поворот), у карты — «Сцена» (расстояние между этажами, толщина плиты, высота объектов).',
					'Неверное значение (толщина 0, узел из пробелов) — ошибка под полем, JSON не меняется. Пустое поле — умолчание карты; экспорт JSON сохраняет 3D-поля.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: IMAGE_MAP_3D_FIELDS, has3dFields: true, selected: 'f1-shop-1' },
	play: async ({ canvas, userEvent }) => {
		const object3d = canvas.getByRole('group', { name: '3D' })
		await expect(within(object3d).getByLabelText('Узел в модели этажа')).toHaveValue('Shop_101')
		await expect(canvas.getByRole('group', { name: 'Этаж «Этаж 1»' })).toBeVisible()

		const scene = canvas.getByRole('group', { name: 'Сцена' })
		const thickness = within(scene).getByRole('spinbutton', { name: 'Толщина плиты этажа' })
		await userEvent.click(thickness)
		await userEvent.keyboard('0')
		await expect(within(scene).getByText('Ожидается число больше 0')).toBeVisible()
		await userEvent.keyboard('{ArrowUp}')
		await expect(within(scene).queryByText('Ожидается число больше 0')).not.toBeInTheDocument()
		await expect(thickness).toHaveValue('1')
	},
}
