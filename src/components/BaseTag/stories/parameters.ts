import type BaseTag from '../ui/BaseTag.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Метка: фильтр, тег записи, выбранное значение. Бывает выбираемой и удаляемой; для набора меток — `BaseTagGroup`.',
				'',
				'- Выбираемая (`isSelectable`, `v-model:is-selected`) — кнопка-переключатель с `aria-pressed`: Enter и Space меняют выбор.',
				'  Выбранная залита цветом роли и показывает галочку — выбор виден не только по цвету.',
				'- Удаляемая (`isRemovable`) — кнопка «Удалить метку …» (словарь) и клавиши Delete и Backspace — событие `remove`;',
				'  метку убирает приложение. У выбираемой кнопка удаления вне Tab (одна остановка на метку), клавиши — в `aria-keyshortcuts`.',
				'- Цвет роли `tone`: neutral, primary, info, success, warning, error — токены `--rise-{роль}-soft`, `-text`, `-border`.',
				'- Варианты: `default` — мягкий фон, `outline` — фон страницы и рамка роли.',
				'',
				'Для статуса без действий подходит и `BaseBadge`; метка — когда её выбирают или удаляют.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseTag>['parameters']
