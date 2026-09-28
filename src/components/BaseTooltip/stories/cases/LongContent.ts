import { docsFrame } from '../shared'
import type meta from '../BaseTooltip.stories'
import { screen, expect } from 'storybook/test'
import BaseTooltip from '../../ui/BaseTooltip.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const LongContent: StoryObj<typeof meta> = {
	args: {
		isAlwaysVisible: true,
		position: 'bottom',
		text: 'Ctrl + Shift + S — сохранить копию проекта.\nКопия появится в списке проектов с пометкой «копия» и текущей датой.',
	},
	parameters: {
		controls: { include: ['text', 'position', 'variant', 'sizeScale'] },
		docs: {
			...docsFrame(180),
			description: {
				story: 'Длинный текст переносится по словам: ширина подсказки не больше 280px. Переносы строк `\\n` сохраняются.',
			},
		},
	},
	render: args => ({
		components: { BaseTooltip, BaseButton },
		setup: () => ({ props: useArgsWithoutSlots(args, []) }),
		template: `
			<BaseTooltip v-bind="props">
				<BaseButton variant="outline">Сохранить копию</BaseButton>
			</BaseTooltip>
		`,
	}),
	play: async () => {
		const tooltip = await screen.findByRole('tooltip')
		const box = tooltip.getBoundingClientRect()
		await expect(box.width).toBeLessThanOrEqual(280)
		await expect(box.height).toBeGreaterThanOrEqual(3 * 16)
	},
}
