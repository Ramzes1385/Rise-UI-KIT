import { docsFrame } from '../../shared'
import { BaseText } from '@components/BaseText'
import { screen, expect } from 'storybook/test'
import type meta from '../../BasePopover.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePopover from '../../../ui/BasePopover.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { isOpen: 'isOpen' }

const template = `
	<BasePopover v-bind="args" v-model:is-open="isOpen">
		<template #trigger>
			<BaseButton variant="outline">Как считается стоимость</BaseButton>
		</template>
		<div class="story-col" style="gap: 4px;">
			<BaseText :color="{ text: { base: 'var(--rise-text-highlighted)' } }" :weight="600">Стоимость озвучки</BaseText>
			<BaseText :color="{ text: { base: 'var(--rise-text-muted)' } }">
				Стоимость зависит от длительности серии, числа ролей и срочности. Минута с одним голосом — базовый тариф,
				каждая следующая роль добавляет 30%, срочная сдача в течение суток — ещё 50%.
			</BaseText>
		</div>
	</BasePopover>
`

export const LongContent: StoryObj<typeof meta> = {
	args: { isOpen: true },
	parameters: {
		controls: { include: ['position', 'variant', 'sizeScale'] },
		docs: {
			...docsFrame(260),
			description: { story: 'Длинный текст переносится по словам: ширина поповера не больше 320px.' },
			source: storySource({ template, imports: ['BasePopover', 'BaseButton', 'BaseText'], models, omit: [] }),
		},
	},
	render: args => ({
		components: { BasePopover, BaseButton, BaseText },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async () => {
		const title = await screen.findByText('Стоимость озвучки')
		const panel = title.closest('.base-dropdown__panel') as HTMLElement
		await expect(panel.getBoundingClientRect().width).toBeLessThanOrEqual(320)
		await expect(panel.getBoundingClientRect().height).toBeGreaterThan(title.getBoundingClientRect().height * 3)
	},
}
