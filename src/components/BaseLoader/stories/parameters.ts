import type { Meta } from '@storybook/vue3-vite'
import type BaseLoader from '../ui/BaseLoader.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Индикатор загрузки неизвестной длительности: пока данные грузятся или сохраняются. Если прогресс известен — `BaseProgress`,',
				'если известна форма будущего содержимого — `BaseSkeleton`.',
				'',
				'- Виды: `spinner` (по умолчанию), `dots`, `pulse`, `bars`. Цвет — основной, `color.text` перекрашивает любой вид.',
				'- Спиннер крутится всегда; пульсация `dots`, `pulse`, `bars` отключается при системной настройке «уменьшить движение».',
				'- Компонент — `role="status"`: доступное имя берётся из `label`, даже если подпись скрыта (`hasLabel: false`).',
				'- `isOverlay` накрывает родительский контейнер подложкой; родителю нужен `position: relative`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseLoader>['parameters']
