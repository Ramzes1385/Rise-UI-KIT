import { ICON_BUTTON } from './shared'
import BaseChip from '../ui/BaseChip.vue'
import { BaseIcon } from '@components/BaseIcon'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseChip, BaseButton, BaseIcon },
	setup: () => ({ props: useArgsWithoutSlots(args) }),
	template: `<div style="padding: 12px;"><BaseChip v-bind="props">${ICON_BUTTON}</BaseChip></div>`,
})) satisfies Meta<typeof BaseChip>['render']
