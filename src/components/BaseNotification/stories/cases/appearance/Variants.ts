import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseNotification from '../../../ui/BaseNotification.vue'
import { NOTIFICATION_VARIANTS } from '../../../types/BaseNotification.types'
import { LIST_OWN_ARGS, LIST_TEMPLATE, listScript, listSetup, withStoryDuration } from '../../shared'

const items = withStoryDuration(
	NOTIFICATION_VARIANTS.map(variant => ({
		type: 'success',
		variant,
		title: `Вариант ${variant}`,
		description: 'Изменения сохранены.',
	})),
)

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
			source: storySource({
				template: LIST_TEMPLATE,
				imports: ['BaseNotification', 'type BaseNotificationExpose', 'type BaseNotificationProps'],
				vue: ['onMounted', 'ref'],
				script: listScript(items),
				omit: LIST_OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseNotification },
		setup: useStorySetup(args, { slots: LIST_OWN_ARGS, setup: () => listSetup(items) }),
		template: LIST_TEMPLATE,
	}),
}
