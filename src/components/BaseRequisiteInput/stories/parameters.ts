import type { Meta } from '@storybook/vue3-vite'
import type BaseRequisiteInput from '../ui/BaseRequisiteInput.vue'

export const parameters = {
	docs: {
		description: {
			component: [
				'Поле реквизита с проверкой: `kind` — ИНН, КПП, ОГРН, ОГРНИП, БИК, расчётный или корреспондентский счёт, СНИЛС.',
				'',
				'- Маска и длина — по реквизиту; в `v-model` — только цифры (у КПП — цифры и заглавные латинские буквы).',
				'- Контрольные числа ИНН, ОГРН, ОГРНИП и СНИЛС проверяются по алгоритмам ФНС и ПФР, счёт — вместе с БИК (`bik`).',
				'- Ошибка появляется, когда введены все знаки или поле потеряло фокус: «Неверное контрольное число», «Счёт не',
				'  подходит к БИК», «Нужно цифр: 10 или 12». Своя ошибка в `error` важнее встроенной.',
				'- Событие `validate`: `true` — верно, `false` — ошибка, `null` — пусто или не хватает знаков. Те же проверки —',
				'  отдельными функциями: `isValidInn`, `isValidKpp`, `isValidOgrn`, `isValidBik`, `isValidAccount`,',
				'  `isValidCorrespondentAccount`, `isValidSnils`.',
			].join('\n'),
		},
	},
} satisfies Meta<typeof BaseRequisiteInput>['parameters']
