import type { Meta } from '@storybook/vue3-vite'
import type BaseTagGroup from '../ui/BaseTagGroup.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Группа меток `BaseTag` по `items`: фильтры, теги записи, выбранные значения. Обёртка — `role="group"` с именем (`label`, по умолчанию «Метки»).',
				'',
				'- `selectionMode`: `none` — только показ и удаление, `single` — одна (`v-model` — значение или `null`), `multiple` — несколько (массив).',
				'  Каждая выбираемая метка — кнопка-переключатель с `aria-pressed` (APG Button, toggle), переход между метками — Tab.',
				'- `isRemovable` (у группы или у метки) — кнопка «Удалить метку …», Delete и Backspace — событие `remove` с меткой и индексом.',
				'  Если приложение убрало метку из `items` сразу, фокус переходит на следующую метку (у последней — на предыдущую, у пустой группы — на саму группу).',
				'- `tone`, `variant`, `color`, `sizeScale` группы передаются меткам; у метки можно задать свой `tone`. Слот `tag` — своё содержимое метки.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseTagGroup>['parameters']
