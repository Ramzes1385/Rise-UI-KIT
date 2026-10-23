import BaseTour from '../ui/BaseTour.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { isOpen: 'isOpen', step: 'step' }

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton id="tour-create">Создать проект</BaseButton>
			<BaseButton id="tour-import" variant="outline">Импорт</BaseButton>
			<BaseButton id="tour-settings" variant="ghost">Настройки</BaseButton>
		</div>
		<div>
			<BaseButton variant="soft" @click="isOpen = true">Запустить тур</BaseButton>
		</div>
	</div>
	<BaseTour v-bind="args" v-model:is-open="isOpen" v-model:step="step" />
`

export const source = storySource({ template, imports: ['BaseTour', 'BaseButton'], models })

export const render = (args => ({
	components: { BaseTour, BaseButton },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseTour>['render']
