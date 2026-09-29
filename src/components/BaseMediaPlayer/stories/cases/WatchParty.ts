import { computed, ref } from 'vue'
import { useDemoWatchParty } from '../watchDemo'
import type meta from '../BaseMediaPlayer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import BaseMediaPlayer from '../../ui/BaseMediaPlayer.vue'
import { expect, fireEvent, within } from 'storybook/test'
import type { BaseMediaPlayerExpose } from '../../types/BaseMediaPlayer.types'

export const WatchParty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			story: { inline: false, height: '560px' },
			description: {
				story: [
					'Совместный просмотр (`watch-party`): кнопка «Совместный просмотр» открывает окно со ссылкой-приглашением,',
					'приглашением по почте и списком участников. Плеер только показывает окно и обменивается командами: письмо',
					'по событию `watch-invite` отправляет приложение, запуск, пауза, перемотка и скорость приходят событием `watch-sync`',
					'— приложение рассылает их участникам через свой сервер (WebSocket, WebRTC), а команды других участников передаёт',
					'в `applyWatchEvent` через ref плеера. Участников и ссылку ведёт приложение (`watchParty.members`, `watchParty.link`).',
					'',
					'В этой истории вместо сервера — BroadcastChannel браузера: скопируйте ссылку и откройте её в новой вкладке — гость',
					'появится в списке «Смотрит», пауза и перемотка станут общими. Браузер запускает звук только после щелчка на',
					'странице, поэтому в новой вкладке один раз нажмите «Воспроизвести». Приглашение по почте здесь добавляет участника',
					'со статусом «Приглашён» — письма нет.',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseMediaPlayer },
		setup() {
			const player = ref<BaseMediaPlayerExpose | null>(null)
			const props = useArgsWithoutSlots(args)
			const party = useDemoWatchParty(player)
			const bindings = computed(() => {
				const base = props.value as Record<string, unknown>
				return {
					...base,
					watchParty: party.room,
					'onWatch-sync': [base['onWatch-sync'], party.send].filter(Boolean),
					'onWatch-invite': [base['onWatch-invite'], party.invite].filter(Boolean),
				}
			})
			return { player, bindings }
		},
		template: '<BaseMediaPlayer ref="player" v-bind="bindings" />',
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const player = within(canvasElement.querySelector('.base-media-player') as HTMLElement)
		await userEvent.click(canvas.getByRole('button', { name: 'Совместный просмотр' }))
		const panel = within(await player.findByRole('group', { name: 'Совместный просмотр' }))
		const link = panel.getByRole('textbox', { name: 'Ссылка-приглашение' }) as HTMLInputElement
		await expect(new URL(link.value).searchParams.get('watch-guest')).toBe('1')
		await userEvent.type(panel.getByRole('textbox', { name: 'Почта участника' }), 'anna@example.com')
		await fireEvent.submit(canvasElement.querySelector('.base-media-player__watch form') as HTMLFormElement)
		await expect(await panel.findByText('anna@example.com')).toBeInTheDocument()
		await expect(panel.getByText('Приглашён')).toBeInTheDocument()
	},
}
