import { computed } from 'vue'
import { docsFrame } from '../shared'
import type meta from '../BaseDropdown.stories'
import { BaseMenu } from '@components/BaseMenu'
import { screen, expect } from 'storybook/test'
import { BaseButton } from '@components/BaseButton'
import BaseDropdown from '../../ui/BaseDropdown.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import type { BaseMenuItem } from '@components/BaseMenu'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

const PROJECTS: BaseMenuItem[][] = [
	[
		'Сайт студии',
		'Мобильное приложение',
		'Сериал «Северный ветер», сезон 1',
		'Сериал «Северный ветер», сезон 2',
		'Аниме «Лисья тропа»',
		'Документальный фильм о реставрации',
		'Подкаст «Голоса»',
		'Аудиокнига «Старый маяк»',
		'Трейлеры осеннего сезона',
		'Архив 2024',
		'Черновики',
		'Шаблоны субтитров',
	].map(label => ({ label })),
]

export const LongContent: StoryObj<typeof meta> = {
	args: { isOpen: true, maxHeight: '200px' },
	parameters: {
		controls: { include: ['maxHeight', 'variant', 'sizeScale'] },
		docs: {
			...docsFrame(280),
			description: { story: 'Длинный список прокручивается внутри панели: высоту ограничивает `maxHeight` (здесь 200px).' },
		},
	},
	render: args => {
		const onUpdate = useModelArg('isOpen')
		return {
			components: { BaseDropdown, BaseButton, BaseMenu },
			setup: () => ({ props: useArgsWithoutSlots(args, []), isOpen: computed(() => args.isOpen), onUpdate, projects: PROJECTS }),
			template: `
				<BaseDropdown v-bind="props" @update:is-open="onUpdate">
					<BaseButton variant="outline" @click="onUpdate(!isOpen)">Проекты</BaseButton>
					<template #dropdown>
						<BaseMenu variant="ghost" :items="projects" @select="onUpdate(false)" />
					</template>
				</BaseDropdown>
			`,
		}
	},
	play: async () => {
		const panel = (await screen.findByText('Сайт студии')).closest('.base-dropdown__panel') as HTMLElement
		await expect(panel.getBoundingClientRect().height).toBeLessThanOrEqual(200)
		await expect(panel.scrollHeight).toBeGreaterThan(panel.clientHeight)
	},
}
