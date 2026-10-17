import type { Meta } from '@storybook/vue3-vite'
import type BaseFlowMap from '../ui/BaseFlowMap.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Анимированная карта взаимодействий и процессов: карта сервисов, BPMN, IDEF0, IDEF3, DFD и свои нотации.',
				'',
				'- Данные — JSON `FlowMapData` (`data`), нотации подключаются пропом `notations`; управление — через ref и `useFlowMap()`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseFlowMap>['parameters']
