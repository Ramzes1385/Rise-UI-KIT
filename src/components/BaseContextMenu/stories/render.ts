import { BaseText } from '@components/BaseText'
import type { Meta } from '@storybook/vue3-vite'
import BaseContextMenu from '../ui/BaseContextMenu.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseContextMenu v-bind="args">
		<div tabindex="0" role="group" class="story-stack" aria-label="Серия 3. Правый клик или Shift+F10 — действия" style="max-width: 320px; padding: 16px; border: 1px dashed var(--rise-border-accented); border-radius: var(--rise-radius-lg);">
			<BaseText :weight="600">Серия 3 · «Туман над заливом»</BaseText>
			<BaseText>Правый клик по карточке, клавиша «Меню» или Shift+F10 — действия с серией.</BaseText>
		</div>
	</BaseContextMenu>
`

export const source = storySource({ template, imports: ['BaseContextMenu', 'BaseText'] })

export const render = (args => ({
	components: { BaseContextMenu, BaseText },
	setup: useStorySetup(args, { slots: [] }),
	template,
})) satisfies Meta<typeof BaseContextMenu>['render']
