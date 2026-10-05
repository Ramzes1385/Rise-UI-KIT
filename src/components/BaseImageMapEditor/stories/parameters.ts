import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMapEditor from '../ui/BaseImageMapEditor.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Редактор интерактивной картинки и карты этажей: готовит JSON, который показывает BaseImageMap.',
				'',
				'- Открывает картинку или SVG; инструменты — точка, прямоугольник, эллипс, многоугольник; выделение, перенос, ручки размера и вершин.',
				'- Панель: объекты слоя, свойства выделенного объекта, этажи и группы; «Объекты из SVG» создаёт объекты по `id` элементов плана.',
				'- `v-model` — JSON карты (новый объект после каждой правки); `v-model:layer`, `v-model:selected`, `v-model:tool`.',
				'  Отмена и повтор — кнопки, Ctrl+Z, Ctrl+Shift+Z, Ctrl+Y; импорт и экспорт JSON файлом; «Просмотр» — карта как у BaseImageMap.',
				'- Доступность: холст — `role="application"` с подсказкой по инструменту; стрелки ведут перекрестие или сдвигают выделенное,',
				'  Enter ставит точку или угол, Delete удаляет, Escape отменяет; результат каждой правки объявляется в `role="status"`.',
				'- `has3dFields` — поля 3D для BaseImageMap3D (вход `/map3d`): высота и узел модели объекта, высота и модель GLB этажа, «Сцена»; без него 3D-поля JSON сохраняются, но не показываются.',
				'- `isDisabled` — только просмотр: выделять объекты можно списком «Объекты слоя». Свои кнопки — слот `toolbar`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseImageMapEditor>['parameters']
