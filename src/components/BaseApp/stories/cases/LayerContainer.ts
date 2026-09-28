import BaseApp from '../../ui/BaseApp.vue'
import type meta from '../BaseApp.stories'
import { defineComponent, ref } from 'vue'
import { BaseMenu } from '@components/BaseMenu'
import { BaseText } from '@components/BaseText'
import { screen, expect } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { BaseDropdown } from '@components/BaseDropdown'

const PlayerDemo = defineComponent({
	components: { BaseButton, BaseDropdown, BaseMenu, BaseText },
	setup() {
		const playerRef = ref<HTMLElement | null>(null)
		const isQualityOpen = ref(false)
		const quality = ref('720p')
		const qualities = [['1080p', '720p', '480p'].map(label => ({ label }))]
		function selectQuality(item: { label: string }): void {
			quality.value = item.label
			isQualityOpen.value = false
		}
		function toggleFullscreen(): void {
			if (document.fullscreenElement) void document.exitFullscreen()
			else void playerRef.value?.requestFullscreen?.().catch(() => undefined)
		}
		return { playerRef, isQualityOpen, quality, qualities, selectQuality, toggleFullscreen }
	},
	template: `
		<div
			ref="playerRef"
			data-theme="dark"
			class="story-stack"
			style="justify-content: flex-end; min-height: 240px; padding: 16px; border-radius: var(--rise-radius-lg); background: var(--rise-bg); color: var(--rise-text);">
			<BaseText>Серия 3 · 24:10</BaseText>
			<div class="story-row">
				<BaseDropdown v-model:is-open="isQualityOpen" position="top-start">
					<BaseButton variant="soft" @click="isQualityOpen = !isQualityOpen">Качество: {{ quality }}</BaseButton>
					<template #dropdown>
						<BaseMenu variant="ghost" :items="qualities" @select="selectQuality" />
					</template>
				</BaseDropdown>
				<BaseButton variant="soft" @click="toggleFullscreen">На весь экран</BaseButton>
			</div>
			<div id="player-layers" />
		</div>
	`,
})

export const LayerContainer: StoryObj<typeof meta> = {
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				story: [
					'Контейнер слоёв (`teleport-to`): окна, панели и подсказки внутри BaseApp телепортируются не в body,',
					'а в заданный элемент. Нужен в полноэкранном режиме — элемент, развёрнутый через Fullscreen API, показывает',
					'только своё содержимое, и панель в body была бы не видна. Здесь меню качества открывается внутри плеера;',
					'«На весь экран» разворачивает плеер, меню остаётся видимым. Контейнер может стоять в том же шаблоне, что и меню.',
				].join('\n'),
			},
			source: {
				code: '<BaseApp teleport-to="#player-layers">\n\t<Player /> <!-- внутри: <div id="player-layers" /> -->\n</BaseApp>',
			},
		},
	},
	render: () => ({
		components: { BaseApp, PlayerDemo },
		template: '<BaseApp teleport-to="#player-layers"><PlayerDemo /></BaseApp>',
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: /Качество/ }))
		const option = await screen.findByRole('button', { name: '1080p' })
		await expect(option.closest('#player-layers')).not.toBeNull()
		await expect(option.closest('.base-dropdown__panel')).toHaveAttribute('data-theme', 'dark')

		await userEvent.click(option)
		await expect(canvas.getByRole('button', { name: 'Качество: 1080p' })).toBeInTheDocument()
	},
}
