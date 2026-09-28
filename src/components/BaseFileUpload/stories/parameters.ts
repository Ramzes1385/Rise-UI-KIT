import type { Meta } from '@storybook/vue3-vite'
import type BaseFileUpload from '../ui/BaseFileUpload.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Загрузка файлов: зона, куда файлы перетаскивают или где их выбирают, и список выбранных файлов.',
				'',
				'- Зона — кнопка: клик, Enter и Space открывают системный выбор файла; подпись `label` связана с полем.',
				'- `accept` и `maxSize` (МБ) проверяют файл при выборе; ошибки проверки и проп `error` выводятся под зоной',
				'  и связаны с ней через `aria-describedby`.',
				'- Без `isMultiple` новый файл заменяет выбранный (`change` отдаёт один файл); с `isMultiple` — до `maxCount` файлов.',
				'- В строке файла — превью изображения (по клику открывается просмотр) или иконка типа, размер и статус.',
				'  Прогресс загрузки пока имитируется компонентом (аудит FU-2).',
				'',
				'Для полей, которые валидирует форма, используйте `BaseForm` + `BaseFormField`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseFileUpload>['parameters']
