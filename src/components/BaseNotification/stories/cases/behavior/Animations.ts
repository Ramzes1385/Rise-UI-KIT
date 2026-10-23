import { ref } from 'vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'
import { expect, waitFor, within } from 'storybook/test'
import { MOTION_PRESETS } from '@composables/app/useMotion'
import BaseNotification from '../../../ui/BaseNotification.vue'
import { literal, storySource, useStorySetup } from '@/stories/helpers'
import type { NotificationItem } from '../../../types/BaseNotification.types'

const presets = MOTION_PRESETS

const TITLES = ['Серия опубликована', 'Файл загружен', 'Комментарий добавлен', 'Ссылка скопирована']

const OWN_ARGS = ['title', 'description', 'items', 'ariaLabel', 'isPersistent']

const template = `
	<div class="story-motion">
		<div class="story-row">
			<BaseButton variant="outline" @click="show">Показать ещё</BaseButton>
			<BaseButton variant="outline" @click="hideFirst">Убрать первое</BaseButton>
		</div>
		<div class="story-motion__presets">
			<div v-for="preset in presets" :key="preset" class="story-motion__preset" :data-rise-motion="preset">
				<span class="story-label">{{ preset }}</span>
				<BaseNotification
					v-bind="args"
					:items="items"
					:aria-label="\`Уведомления: \${preset}\`"
					is-persistent
					@remove="hide" />
			</div>
		</div>
	</div>
`

const script = `
const presets = ${literal(presets)}
const titles = ${literal(TITLES)}
const items = ref<NotificationItem[]>([{ id: 0, title: titles[0], type: 'success', isPersistent: true }])
let next = 1

function show(): void {
	items.value = [{ id: next, title: titles[next % titles.length], type: 'success', isPersistent: true }, ...items.value]
	next++
}

function hide(id: NotificationId): void {
	items.value = items.value.filter(item => item.id !== id)
}

function hideFirst(): void {
	if (items.value.length) hide(items.value[0].id)
}
`

function useNotificationQueue() {
	const items = ref<NotificationItem[]>([{ id: 0, title: TITLES[0], type: 'success', isPersistent: true }])
	let next = 1
	const hide = (id: NotificationItem['id']): void => {
		items.value = items.value.filter(item => item.id !== id)
	}
	return {
		items,
		show: (): void => {
			items.value = [{ id: next, title: TITLES[next % TITLES.length], type: 'success', isPersistent: true }, ...items.value]
			next++
		},
		hide,
		hideFirst: (): void => {
			if (items.value.length) hide(items.value[0].id)
		},
	}
}

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	args: { animation: 'scale' },
	parameters: {
		controls: { include: ['animation', 'position', 'variant'] },
		docs: {
			description: {
				story: [
					'Появление, уход и сдвиг соседей в четырёх пресетах движения (`data-rise-motion` колонки). Проп `animation`:',
					'`scale` (по умолчанию) — прозрачность и масштаб `--rise-motion-scale-from`, `fade` — прозрачность, `slide` — сдвиг',
					'со стороны угла `position` на `--rise-motion-distance`, `pop` — масштаб с пружиной, `none` — сразу. Соседи сдвигаются',
					'плавно (`transform`), уходящая карточка не занимает места. В `none` и при «уменьшить движение» — без движения.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseNotification', 'BaseButton', 'type NotificationId', 'type NotificationItem'],
				vue: ['ref'],
				script,
				omit: OWN_ARGS,
			}),
		},
	},
	render: args => ({
		components: { BaseNotification, BaseButton },
		setup: useStorySetup(args, { slots: OWN_ARGS, data: { presets }, setup: useNotificationQueue }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		const regions = await canvas.findAllByRole('region')
		await expect(regions).toHaveLength(4)
		await userEvent.click(canvas.getByRole('button', { name: 'Показать ещё' }))
		await waitFor(() => expect(within(regions[0]).getAllByRole('status')).toHaveLength(2))
		await userEvent.click(canvas.getByRole('button', { name: 'Убрать первое' }))
		await waitFor(() => expect(within(regions[3]).getAllByRole('status')).toHaveLength(1))
		await expect(within(regions[3]).getByRole('status')).toHaveTextContent('Серия опубликована')
	},
}
