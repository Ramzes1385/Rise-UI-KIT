import { expect } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { FRAME_STYLE, SLOT_KEYS } from '../../shared'
import BaseMegaMenu from '../../../ui/BaseMegaMenu.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const frameStyle = FRAME_STYLE

const models = { openKey: 'openKey' }

const template = `
	<div :style="frameStyle">
		<BaseMegaMenu v-bind="args" v-model:open-key="openKey">
			<template #end>
				<BaseButton variant="ghost">Войти</BaseButton>
				<BaseButton>Попробовать бесплатно</BaseButton>
			</template>
		</BaseMegaMenu>
	</div>
`

export const WithEnd: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Слот `end` — правая часть строки: вход, главная кнопка, поиск или переключатель темы.' },
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseMegaMenu'],
				models,
				script: `const frameStyle = ${literal(frameStyle)}`,
				omit: SLOT_KEYS,
			}),
		},
	},
	args: { openKey: undefined },
	render: args => ({
		components: { BaseMegaMenu, BaseButton },
		setup: useStorySetup(args, { models, data: { frameStyle }, slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Попробовать бесплатно' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Продукты' })).toHaveAttribute('aria-expanded', 'false')
	},
}
