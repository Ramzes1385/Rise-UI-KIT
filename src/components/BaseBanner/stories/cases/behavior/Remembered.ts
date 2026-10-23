import type meta from '../../BaseBanner.stories'
import { expect, waitFor } from 'storybook/test'
import BaseBanner from '../../../ui/BaseBanner.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const MODELS = { isOpen: 'isOpen' } as const

const STORAGE_NAME = 'rise-banner:story-remembered'

const template = `
	<div class="story-stack">
		<BaseBanner v-bind="args" v-model:is-open="isOpen" />
		<BaseButton v-if="!isOpen" variant="outline" @click="isOpen = true">Показать снова</BaseButton>
	</div>
`

export const Remembered: StoryObj<typeof meta> = {
	args: {
		type: 'info',
		variant: 'soft',
		text: 'Мы обновили условия обслуживания. Это объявление больше не появится после закрытия.',
		isClosable: true,
		storageKey: 'story-remembered',
	},
	parameters: {
		docs: {
			description: {
				story: [
					'`storageKey` запоминает закрытие в `localStorage` под ключом `rise-banner:<ключ>`: после перезагрузки страницы',
					'закрытое объявление не показывается. Хранилище читается после монтирования; если оно недоступно, объявление просто видно.',
					'Здесь «Показать снова» возвращает показ до перезагрузки; чтобы увидеть объявление после неё, удалите запись из `localStorage`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseBanner', 'BaseButton'], models: MODELS }),
		},
	},
	render: args => ({
		components: { BaseBanner, BaseButton },
		setup: useStorySetup(args, { models: MODELS }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		localStorage.removeItem(STORAGE_NAME)
		const restore = canvas.queryByRole('button', { name: 'Показать снова' })
		if (restore) await userEvent.click(restore)
		await userEvent.click(await canvas.findByRole('button', { name: 'Закрыть' }))
		await waitFor(() => expect(canvas.queryByRole('region')).toBeNull())
		await expect(localStorage.getItem(STORAGE_NAME)).toBe('closed')
		localStorage.removeItem(STORAGE_NAME)
	},
}
