import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMap from '../ui/BaseImageMap.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Интерактивная картинка и карта этажей: точки, области и элементы SVG поверх картинки или плана, подсказки при наведении, окна с подробностями, этажи и масштаб.',
				'',
				'- Данные — один JSON (`ImageMapData`): `layers` (картинка или SVG, строкой или по адресу), `objects` (`point`, `rect`, `ellipse`, `polygon`, `svg` по `id`), `groups` и `styles` (`base`, `hover`, `active` на токенах). Координаты — доли картинки 0–1.',
				'- По клику — `action`: `popup` (BaseModal, на узком экране — BaseDrawer снизу), `link`, `layer` (переход на этаж), `none`. `v-model:active` и `v-model:layer`, события `select`, `hover`, `layer-change`.',
				'- Масштаб — кнопки, клавиши `+` `-` `0`, перетаскивание, щипок; колесо — с Ctrl или ⌘ (`wheelZoom`), чтобы не мешать прокрутке страницы. Полный экран, `initArea`, `hasZoomToActive`.',
				'- Доступность: объекты — кнопки или ссылки с именами, одна точка Tab и стрелки между объектами, Enter открывает окно, после закрытия фокус возвращается на объект. SVG слоя очищается: без скриптов, обработчиков и внешних ссылок.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseImageMap>['parameters']
