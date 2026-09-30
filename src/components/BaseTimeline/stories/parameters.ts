import { source } from './render'
import type { Meta } from '@storybook/vue3-vite'
import type BaseTimeline from '../ui/BaseTimeline.vue'

export const parameters = {
	docs: {
		source,
		description: {
			component: [
				'Хронология событий, которые уже случились: история заказа, изменения документа, журнал действий. Отвечает на',
				'вопрос «что и когда произошло». Шаги процесса, по которым пользователь идёт вперёд, — BaseStepper.',
				'',
				'- Разметка — упорядоченный список `<ol>`; дата — `<time datetime>` в формате языка (`dateFormat`), строка не-дата выводится как есть.',
				'- `currentId` — текущее событие: `aria-current="step"`, следующие приглушены как предстоящие.',
				'- Маркер — иконка события или точка, цвет — роль (`color`: success, warning, error, info, neutral).',
				'- `orientation="horizontal"` — лента слева направо с прокруткой; слот `item` — своё содержимое события.',
				'- `isGrouped` — события по дням: заголовок дня и время у событий; `datePosition="side"` — время колонкой слева.',
				'- `media` у события — картинка 16:9 (BaseImage), по клику открывается крупно.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseTimeline>['parameters']
