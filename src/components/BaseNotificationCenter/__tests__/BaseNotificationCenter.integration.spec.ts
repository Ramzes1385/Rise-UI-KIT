import '@testing-library/jest-dom/vitest'
import { h, ref } from 'vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import BaseNotificationCenter from '../ui/BaseNotificationCenter.vue'
import type { NotificationCenterItem } from '../types/BaseNotificationCenter.types'

describe('BaseNotificationCenter integration', () => {
	it('v-model:items: прочитанное уходит из фильтра «Непрочитанные»', async () => {
		const items = ref<NotificationCenterItem[]>([
			{ id: 'a', title: 'Первое', date: 0 },
			{ id: 'b', title: 'Второе', date: 0 },
		])
		render({
			setup: () => () =>
				h(BaseNotificationCenter, {
					items: items.value,
					filter: 'unread',
					'onUpdate:items': (value: NotificationCenterItem[]) => (items.value = value),
				}),
		})
		await fireEvent.click(screen.getByRole('button', { name: /^Первое/ }))
		expect(screen.queryByText('Первое')).not.toBeInTheDocument()
		expect(screen.getByRole('status')).toHaveTextContent('1 новое')
	})
})
