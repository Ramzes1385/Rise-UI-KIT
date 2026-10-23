import type BaseCard from '../ui/BaseCard.vue'
import type { Meta } from '@storybook/vue3-vite'

const BODY = 'Выручка выросла на 12% к апрелю, средний чек — на 4%. Больше всего заказов пришло из мобильного приложения.'

export const args = {
	title: 'Отчёт за май',
	subtitle: 'Обновлён 15 мая',
	default: BODY,
	variant: 'default',
	isHoverable: false,
	scroll: false,
	isDisabled: false,
	sizeScale: 100,
} satisfies Meta<typeof BaseCard>['args']
