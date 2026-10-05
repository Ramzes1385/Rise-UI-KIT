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
				'- Часть 1 из 4: построение сцены, камера, выбор объектов и маршруты в 3D появятся в следующих частях.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseImageMap3D>['parameters']
