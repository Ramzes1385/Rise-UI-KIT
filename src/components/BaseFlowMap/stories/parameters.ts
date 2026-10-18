import type { Meta } from '@storybook/vue3-vite'
import type BaseFlowMap from '../ui/BaseFlowMap.vue'

export const parameters = {
	a11y: { config: { rules: [{ id: 'scrollable-region-focusable', enabled: false }] } },
	docs: {
		description: {
			component: [
				'Анимированная карта взаимодействий и процессов: карта сервисов, BPMN, IDEF0, IDEF3, DFD и свои нотации. Выбирайте её, когда нужно показать, как связаны сервисы, шаги процесса или функции системы, и проиграть путь запроса по связям.',
				'',
				'- Данные — JSON `FlowMapData` (`data`, в режиме «Правка» — `v-model:data`); нотация — поле `notation` данных, встроенная `services`, остальные — проп `notations`.',
				'- Раскладка слоистая: направление `LR`, `TB`, `RL`, `BT`, ярусы и полосы дорожек, линии `curved`, `orthogonal`, `straight`. Размер холста — проп `height`, масштаб текста и карточек — `sizeScale`.',
				'- Управление — через `ref` и `useFlowMap()`: выделение, масштаб, сценарии, живые статусы и метрики, подписка на события и хуки (`controller.on`).',
				'- Доступность: область `role="region"`, холст `graphics-document`, узлы `graphics-object`; Tab входит в холст, стрелки ведут по геометрии, `]` и `[` — по связям, Enter — выбор, Escape — снять; рядом скрытый список узлов и связей и live-регион. Холст — LTR-островок и в RTL; панели зеркалятся.',
				'- Узлы — HTML-карточки кита (BaseIcon, статус и метрики) или SVG-фигуры нотации; загрузка — BaseSkeleton, ошибка — BaseResult.',
				'- Связанные компоненты: BaseTimeline, BaseKanban, BaseTree.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseFlowMap>['parameters']
