import type meta from '../BaseButtonGroup.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseButtonGroup from '../../ui/BaseButtonGroup.vue'
import { BaseSplitButton } from '@components/BaseSplitButton'

export const WithSplitButton: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'С кнопкой меню: BaseSplitButton в группе получает общие скругления.' } } },
	render: args => ({
		components: { BaseButtonGroup, BaseButton, BaseSplitButton },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['ariaLabel']),
			items: [{ label: 'Сохранить как шаблон' }, { label: 'Сохранить копию' }],
		}),
		template: `
			<BaseButtonGroup v-bind="props" aria-label="Документ">
				<BaseButton variant="outline">Отмена</BaseButton>
				<BaseSplitButton variant="outline" label="Сохранить" :items="items" />
			</BaseButtonGroup>
		`,
	}),
}
