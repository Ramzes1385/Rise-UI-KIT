import type { Meta } from '@storybook/vue3-vite'
import type BaseSkeleton from '../ui/BaseSkeleton.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Заглушка на месте содержимого, которое загружается: повторяет его форму, чтобы страница не прыгала.',
				'Если форма содержимого неизвестна — `BaseLoader`.',
				'',
				'- Формы: `text` — строка 16px, `rect` — блок (изображение, карточка), `circle` — аватар. Размеры — `width`/`height`.',
				'- Шиммер (`isAnimated`, по умолчанию) и мерцание (`isPulse`) отключаются при системной настройке «уменьшить движение».',
				'- Скелетон скрыт от скринридеров (`aria-hidden`): о загрузке сообщает контейнер — `aria-busy="true"` и подпись.',
				'- Плавная смена на содержимое — `<Transition name="base-skeleton" mode="out-in">` вокруг `v-if`/`v-else` (история «Анимации»).',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseSkeleton>['parameters']
