import { docsFrame } from '../../shared'
import type meta from '../../BaseTour.stories'
import BaseTour from '../../../ui/BaseTour.vue'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, expect, within } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { isOpen: 'isOpen', step: 'step' }

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton id="tour-create">Создать проект</BaseButton>
			<BaseButton id="tour-import" variant="outline">Импорт</BaseButton>
			<BaseButton id="tour-settings" variant="ghost">Настройки</BaseButton>
		</div>
	</div>
	<BaseTour v-bind="args" v-model:is-open="isOpen" v-model:step="step">
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
`

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
			source: storySource({ template, imports: ['BaseTour', 'BaseButton', 'BaseIcon', 'BaseText'], models }),
		},
	},
	render: args => ({
		components: { BaseTour, BaseButton, BaseIcon, BaseText },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Новый проект' })
		await expect(await within(dialog).findByText(/Шаг 1 из 3/)).toBeInTheDocument()
	},
}
