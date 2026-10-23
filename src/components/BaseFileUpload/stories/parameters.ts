import type { Meta } from '@storybook/vue3-vite'
import type BaseFileUpload from '../ui/BaseFileUpload.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Загрузка файлов: зона, куда файлы перетаскивают или где их выбирают, и список выбранных файлов.',
				'',
				'- Зона — кнопка: клик, Enter и Space открывают системный выбор файла; подпись `label` связана с полем.',
				'- `accept` и `maxSize` (МБ) проверяют файл при выборе; ошибки проверки и проп `error` выводятся под зоной,',
				'  связаны с ней через `aria-describedby` и озвучиваются (`role="alert"`).',
				'- Без `isMultiple` новый файл заменяет выбранный (`change` отдаёт один файл); с `isMultiple` — до `maxCount` файлов.',
				'- В строке файла — превью изображения (по клику открывается просмотр; `allowPreview: false` — иконка) или иконка типа и размер.',
				'- Загрузку выполняет приложение: функция `uploader(file, { onProgress, signal })`. Кит показывает её прогресс,',
				'  «Загружено» или ошибку с повтором и озвучивает итог; без `uploader` файлы только выбираются — без прогресса.',
				'- `isRequired` — `validate()` через ref без файлов вернёт `false`; `reset()` очищает список; `focus()` — на зону.',
				'',
				'Для полей, которые валидирует форма, используйте `BaseForm` + `BaseFormField`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseFileUpload>['parameters']
