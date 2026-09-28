import BaseToolbar from '../ui/BaseToolbar.vue'
import { BaseIcon } from '@components/BaseIcon'
import type { Meta } from '@storybook/vue3-vite'
import { BaseButton } from '@components/BaseButton'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { BaseSeparator } from '@components/BaseSeparator'
import { FORMAT_BUTTONS, ALIGN_BUTTONS, TOOLBAR_TEMPLATE } from './shared'

export const render = (args => ({
	components: { BaseToolbar, BaseButton, BaseIcon, BaseSeparator },
	setup: () => ({ props: useArgsWithoutSlots(args, []), format: FORMAT_BUTTONS, align: ALIGN_BUTTONS, disabledIcon: '' }),
	template: TOOLBAR_TEMPLATE,
})) satisfies Meta<typeof BaseToolbar>['render']
