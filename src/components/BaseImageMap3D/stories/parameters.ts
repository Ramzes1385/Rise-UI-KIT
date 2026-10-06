import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMap3D from '../ui/BaseImageMap3D.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'3D-карта этажей на three.js — отдельный вход пакета `@ramzes1385/rise-ui-kit/map3d`; `three` — необязательная peer-зависимость, основной вход его не тянет.',
				'',
				'- Данные — те же `ImageMapData`, что у BaseImageMap, плюс необязательные 3D-поля (`ImageMap3DData`): `layer.model` (GLB), `layer.elevation`, `object.height3d`, `object.meshName`, `data.scene3d`. Неверные поля — предупреждение в консоли при разработке.',
				'- `v-model:view`: `3d` (по умолчанию) или `2d` — BaseImageMap с теми же данными, пропсами и слотами. Без WebGL или при ошибке рендерера — автоматически 2D, сообщение `role="status"` и событие `fallback`.',
				'- Рендер по требованию (`invalidate()`), размер — `ResizeObserver`, при размонтировании освобождаются геометрии, материалы, текстуры и контекст WebGL.',
				'- Сцена: пол этажа — картинка слоя (`image`, `svg`, `svgUrl`), объекты `rect`, `ellipse`, `polygon` и `svg` выдавлены на `height3d`; этаж из GLB (`layer.model`) — меши по `meshName ?? id`, DRACO и KTX2 — через `configureLoader`. Цвета состояний — стили BaseImageMap и токены темы.',
				'- `layerMode`: `stack` — этажи стопкой (неактивные полупрозрачны), `single` — только активный. `camera`: `isometric` (вид Mapplic) или `perspective`; вращение, наклон и масштаб — мышью, касанием, клавишами и кнопками, переходы плавные.',
				'- Выбор: наведение и щелчок (касание — сдвиг до 4 px), клавиатура (стрелки, Home и End, Enter или пробел, Escape, PageUp и PageDown), карточка и окно объекта, каталог (`hasDirectory`), маршруты (`hasRoutes`), переключатель 3D / 2D (`has2dToggle`). Масштаб — кнопки, Ctrl или ⌘ с колесом мыши и щипок двумя пальцами.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseImageMap3D>['parameters']
