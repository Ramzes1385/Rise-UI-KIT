import { expect } from 'storybook/test'
import type meta from '../Theming.stories'
import { BaseCard } from '@components/BaseCard'
import { BaseAlert } from '@components/BaseAlert'
import { BaseAvatar } from '@components/BaseAvatar'
import { BaseLoader } from '@components/BaseLoader'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseProgress } from '@components/BaseProgress'
import { BaseSeparator } from '@components/BaseSeparator'
import { staticStorySource, useStorySetup } from '@/stories/helpers'

const COLOR_STATE = {
	color: { bg: { base: 'var(--rise-success)' }, text: { base: 'var(--rise-on-success)' } },
}

const template = `
	<div class="story-col" style="width: 100%; max-width: 420px;">
		<BaseCard title="Карточка с цветом" :color="color" data-testid="parent-card">
			<template #header>
				<div class="story-row">
					<BaseLoader variant="spinner" data-testid="nested" />
					<BaseAvatar name="Анна Иванова" data-testid="nested" />
					<BaseProgress :value="60" data-testid="nested" />
					<BaseSeparator data-testid="nested" />
				</div>
			</template>
			Цвет красит саму карточку, но не вложенные компоненты.
		</BaseCard>
		<BaseAlert type="info" title="Алерт с цветом" :color="color" data-testid="parent-alert">
			<div class="story-row">
				<BaseLoader variant="spinner" data-testid="nested" />
				<BaseAvatar name="Пётр Сидоров" data-testid="nested" />
				<BaseProgress :value="40" data-testid="nested" />
			</div>
		</BaseAlert>
	</div>
`

export const NestedColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Цвет компонента (`color`) красит сам компонент и его собственные части, но не вложенные компоненты кита.',
					'Переменные `--custom-bg*` и `--custom-text*` каждый компонент сбрасывает на своём корне, поэтому Loader, Avatar,',
					'Progress и Separator внутри цветной карточки или алерта выглядят как обычно (DESIGN_SYSTEM, правило 11).',
					'Чтобы покрасить вложенный компонент, передайте ему собственный `color`.',
				].join('\n'),
			},
			source: staticStorySource({
				template,
				imports: ['BaseAlert', 'BaseAvatar', 'BaseCard', 'BaseLoader', 'BaseProgress', 'BaseSeparator'],
				state: COLOR_STATE,
			}),
		},
	},
	render: args => ({
		components: { BaseAlert, BaseAvatar, BaseCard, BaseLoader, BaseProgress, BaseSeparator },
		setup: useStorySetup(args, { state: COLOR_STATE }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const card = canvasElement.querySelector('[data-testid="parent-card"]') as HTMLElement
		const alert = canvasElement.querySelector('[data-testid="parent-alert"]') as HTMLElement
		await expect(getComputedStyle(card).getPropertyValue('--custom-bg').trim()).not.toBe('')
		await expect(getComputedStyle(alert).getPropertyValue('--custom-bg').trim()).not.toBe('')

		const nested = canvasElement.querySelectorAll('[data-testid="nested"]')
		await expect(nested.length).toBe(7)
		nested.forEach(element => {
			const style = getComputedStyle(element)
			expect(style.getPropertyValue('--custom-bg').trim()).toBe('')
			expect(style.getPropertyValue('--custom-text').trim()).toBe('')
		})
	},
}
