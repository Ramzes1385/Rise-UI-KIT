import { listRender } from '../shared'
import type meta from '../BaseNotification.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { NOTIFICATION_VARIANTS } from '../../types/BaseNotification.types'

export const Variants: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale'] },
		docs: {
			description: {
				story: [
					'Пять вариантов. `default` — карточка с тенью; `soft` — мягкий фон цвета типа; `outline` — рамка цвета типа без тени;',
					'`shadow` — только тень; `ghost` — без фона и рамки. Вариант задаётся пропом или для отдельного уведомления в `add()`.',
				].join('\n'),
			},
			source: {
				code: NOTIFICATION_VARIANTS.map(variant => `notifications.value.add({ variant: '${variant}', title: '…' })`).join('\n'),
			},
		},
	},
	render: listRender(
		NOTIFICATION_VARIANTS.map(variant => ({
			type: 'success',
			variant,
			title: `Вариант ${variant}`,
			description: 'Изменения сохранены.',
		})),
	),
}
