import type meta from '../../BaseTour.stories'
import BaseTour from '../../../ui/BaseTour.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { docsFrame, DEMO_TOOLBAR } from '../../shared'
import { screen, expect, within } from 'storybook/test'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const CustomContent: StoryObj<typeof meta> = {
	args: { isOpen: true },
	parameters: {
		docs: {
			description: {
				story: [
					'Свои заголовок и текст — слоты `title` и `content` (получают `step` и `index`). Слот по умолчанию заменяет всю',
					'карточку и получает ещё `next`, `prev`, `skip`, `finish`.',
				].join('\n'),
			},
			...docsFrame(320),
			source: {
				code: [
					'<BaseTour v-model:is-open="isOpen" :steps="steps">',
					'  <template #title="{ step }">…</template>',
					'  <template #content="{ step, index }">…</template>',
					'</BaseTour>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onOpen = useModelArg('isOpen')
		const onStep = useModelArg('step')
		return {
			components: { BaseTour, BaseButton, BaseIcon, BaseText },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onOpen, onStep }),
			template: `
				<div class="story-stack">${DEMO_TOOLBAR}</div>
				<BaseTour v-bind="props" @update:is-open="onOpen" @update:step="onStep">
					<template #title="{ step }">
						<div class="story-row" style="gap: 6px;">
							<BaseIcon name="info" :size-scale="80" />
							<BaseText :color="{ text: { base: 'var(--rise-text-highlighted)' } }" :weight="600">{{ step.title }}</BaseText>
						</div>
					</template>
					<template #content="{ step, index }">
						<BaseText :color="{ text: { base: 'var(--rise-text-muted)' } }">{{ step.content }} Шаг {{ index + 1 }} из 3.</BaseText>
					</template>
				</BaseTour>
			`,
		}
	},
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Новый проект' })
		await expect(await within(dialog).findByText(/Шаг 1 из 3/)).toBeInTheDocument()
	},
}
