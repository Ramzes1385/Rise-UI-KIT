import type meta from '../BaseModal.stories'
import BaseModal from '../../ui/BaseModal.vue'
import { BaseText } from '@components/BaseText'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

const SUBTITLES = [
	{ time: '00:00:01', text: 'Добро пожаловать в студию.' },
	{ time: '00:00:04', text: 'Сегодня мы запишем первую серию.' },
	{ time: '00:00:08', text: 'Проверьте микрофоны и наушники.' },
	{ time: '00:00:12', text: 'Начинаем по моему сигналу.' },
] as const

export const FullScreen: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'На весь экран: `fullScreen="both"` (или `width`, `height`) растягивает окно с отступом 16px от краёв.' },
		},
	},
	tags: ['!autodocs'],
	args: { isOpen: true, fullScreen: 'both', title: 'Предпросмотр субтитров' },
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseModal, BaseButton, BaseText },
			setup: () => ({ props: useArgsWithoutSlots(args), lines: SUBTITLES, onUpdate }),
			template: `
				<BaseButton variant="outline" @click="onUpdate(true)">Предпросмотр</BaseButton>
				<BaseModal v-bind="props" @update:is-open="onUpdate">
					<div class="story-stack">
						<BaseText v-for="line in lines" :key="line.time">{{ line.time }} — {{ line.text }}</BaseText>
					</div>
					<template #footer>
						<BaseButton variant="outline" @click="onUpdate(false)">Закрыть</BaseButton>
						<BaseButton @click="onUpdate(false)">Экспортировать</BaseButton>
					</template>
				</BaseModal>
			`,
		}
	},
	play: async () => {
		const dialog = await screen.findByRole('dialog', { name: 'Предпросмотр субтитров' })
		await waitFor(() => expect(getComputedStyle(dialog).transform).toBe('none'))
		const box = dialog.getBoundingClientRect()
		const viewport = document.documentElement
		await expect(box.width).toBeCloseTo(viewport.clientWidth - 32, 0)
		await expect(box.height).toBeCloseTo(viewport.clientHeight - 32, 0)
	},
}
