import type BaseText from '../ui/BaseText.vue'
import type { Meta } from '@storybook/vue3-vite'
import { TEXT_WEIGHT } from '../model/textWeight'

export const args = {
	default: 'Сохраните изменения, чтобы их увидели участники проекта.',
	tag: 'p',
	weight: TEXT_WEIGHT.REGULAR,
	sizeScale: 100,
	nowrap: false,
	truncate: false,
	maxLines: 1,
} satisfies Meta<typeof BaseText>['args']
