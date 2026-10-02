import { ORDER } from '../../shared'
import { expect } from 'storybook/test'
import { BaseLink } from '@components/BaseLink'
import { BaseBadge } from '@components/BaseBadge'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseDescriptions.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseDescriptions from '../../../ui/BaseDescriptions.vue'

const template = `
	<BaseDescriptions v-bind="args">
		<template #extra>
			<BaseButton variant="outline" :size-scale="87.5">Изменить</BaseButton>
		</template>
		<template #value-status>
			<BaseBadge label="Оплачен" :color="{ bg: { base: 'var(--rise-success-soft)' }, text: { base: 'var(--rise-success-text)' } }" />
		</template>
		<template #value-email="{ item }">
			<BaseLink :href="'mailto:' + item.value" :label="String(item.value)" />
		</template>
	</BaseDescriptions>
`

export const CustomSlots: StoryObj<typeof meta> = {
	args: { items: ORDER, title: 'Заказ З-1052', columns: 2 },
	parameters: {
		docs: {
			description: {
				story: [
					'Слоты поля по ключу: `value-status` — BaseBadge вместо кода статуса, `value-email` — ссылка BaseLink;',
					'`extra` — кнопка справа от заголовка. Слоты `label` и `value` без ключа меняют все поля сразу.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseDescriptions', 'BaseBadge', 'BaseButton', 'BaseLink'] }),
		},
		controls: { include: ['columns', 'layout', 'variant'] },
	},
	render: args => ({
		components: { BaseDescriptions, BaseBadge, BaseButton, BaseLink },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Оплачен')).toBeVisible()
		await expect(canvas.queryByText('paid')).toBeNull()
		await expect(canvas.getByRole('link', { name: 'pavel@example.com' })).toHaveAttribute('href', 'mailto:pavel@example.com')
		await expect(canvas.getByRole('button', { name: 'Изменить' })).toBeVisible()
	},
}
