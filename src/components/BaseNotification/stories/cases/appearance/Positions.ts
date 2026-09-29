import { ref, computed } from 'vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { screen, waitFor, expect } from 'storybook/test'
import BaseNotification from '../../../ui/BaseNotification.vue'
import type { BaseNotificationExpose } from '../../../types/BaseNotification.types'

export const Positions: StoryObj<typeof meta> = {
	args: { isContained: false, position: 'top-right' },
	parameters: {
		controls: { include: ['position', 'variant'] },
		docs: {
			description: {
				story: [
					'Позиция на экране — `position` (без `isContained`): контейнер закреплён в углу или у края экрана с отступом 16px.',
					'Меняйте значение в Controls; «Показать ещё» добавляет уведомление в стопку (исчезает через 3 секунды).',
				].join('\n'),
			},
			story: { inline: false, height: '240px' },
			source: { code: '<BaseNotification position="top-right" type="success" title="Изменения сохранены" />' },
		},
	},
	render: args => ({
		components: { BaseNotification, BaseButton },
		setup: () => {
			const list = ref<BaseNotificationExpose | null>(null)
			const key = computed(() => `${args.position}-${args.variant}`)
			const showMore = () => list.value?.add({ type: 'info', title: 'Ещё одно уведомление', duration: 3000 })
			return { props: useArgsWithoutSlots(args, []), key, list, showMore }
		},
		template: `
			<BaseButton variant="outline" @click="showMore">Показать ещё</BaseButton>
			<BaseNotification ref="list" :key="key" v-bind="props" />
		`,
	}),
	play: async () => {
		const item = await screen.findByRole('status')
		await waitFor(() => expect(item.getBoundingClientRect().right).toBeCloseTo(document.documentElement.clientWidth - 16, 0))
		await expect(item.getBoundingClientRect().top).toBeCloseTo(16, 0)
	},
}
