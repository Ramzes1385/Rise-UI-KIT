import type BaseForm from '../ui/BaseForm.vue'
import type { Meta } from '@storybook/vue3-vite'

export const parameters = {
	docs: {
		description: {
			component: [
				'Обёртка над `<form>`: отправка без перезагрузки страницы, состояния загрузки и блокировки.',
				'',
				'- Событие `submit` приходит, только если форма не в `isLoading` и не в `isDisabled`; нативная отправка всегда отменяется.',
				'- `isLoading` показывает подложку с лоадером, ставит `aria-busy` и блокирует нативные поля через `<fieldset disabled>`;',
				'  после разблокировки фокус возвращается на поле или кнопку, где был.',
				'- Раскладку полей задаёт содержимое (или `customClass.content`). Кнопке отправки нужен `type="submit"`.',
				'- Кастомные контролы кита (BaseSelect, BaseRange, BaseRating, BaseFileUpload, BaseEditor, BaseCheckboxGroup) блокируются вместе с формой.',
				'- `schema` (Standard Schema: Zod, Valibot, ArkType) проверяет `state` перед `submit`; ошибки показывают BaseFormField с тем же `name`,',
				'  фокус уходит на первое поле с ошибкой, после первой отправки ошибки исчезают по мере исправления.',
				'',
				'Имя форме даёт `aria-label` на компоненте. Подпись и ошибку поля задают props поля или обёртка `BaseFormField`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseForm>['parameters']
