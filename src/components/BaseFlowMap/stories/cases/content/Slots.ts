import { flowNode } from '../../shared'
import { BaseIcon } from '@components/BaseIcon'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap v-bind="args" :panels="['toolbar', 'legend']">
		<template #node="{ node, status, isSelected }">
			<span class="story-col">
				<strong>{{ node.label }}</strong>
				<BaseBadge :variant="status === 'warning' ? 'soft' : 'outline'">{{ isSelected ? 'выбран' : node.subtitle }}</BaseBadge>
			</span>
		</template>
		<template #edge-label="{ edge, isActive }">
			<span>{{ isActive ? '▶ ' : '' }}{{ edge.label }}</span>
		</template>
		<template #group-label="{ group }">▸ {{ group.label }}</template>
		<template #toolbar="{ controller }">
			<BaseButton variant="ghost" aria-label="Выбрать Orders" @click="controller.select(['orders'])"><BaseIcon name="star" /></BaseButton>
		</template>
	</BaseFlowMap>
`

export const Slots: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Слоты заменяют части карты своей разметкой: `node` — содержимое HTML-узла (здесь подпись и BaseBadge вместо карточки кита; данные слота — `node`, `kind`, `status`, `metrics`, `isSelected`, `isFocused`, `isActive`, `zoom`),',
					'`edge-label` — подпись связи, `group-label` — заголовок дорожки, `toolbar` — кнопки в конце панели инструментов (получает `controller`), `legend`, `details`, `tooltip`, `scenario-step` и `empty` — свои легенда, подробности, подсказка, строка шага и пустая карта.',
					'Слот не отменяет доступность: роль, имя и клавиатура узла остаются на обёртке ядра.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'BaseBadge', 'BaseButton', 'BaseIcon'], omit: ['panels'] }),
		},
	},
	render: args => ({
		components: { BaseFlowMap, BaseBadge, BaseButton, BaseIcon },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const orders = flowNode(canvas, 'Orders')
		await expect(orders.querySelector('.base-badge')).toHaveTextContent('Go · 840 rps')
		await expect(orders.querySelector('.base-flow-map__node-label')).toBeNull()
		await expect(canvas.getByText('▸ Клиенты')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Выбрать Orders' }))
		await waitFor(() => expect(orders).toHaveAttribute('aria-current', 'true'))
		await waitFor(() => expect(orders.querySelector('.base-badge')).toHaveTextContent('выбран'))
	},
}
