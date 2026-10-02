import type { Meta } from '@storybook/vue3-vite'
import type BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { CRYPTO_PRO_SIGN_VARIANTS } from '../types/BaseCryptoProSign.types'

export const argTypes = {
	...baseArgTypes({ variants: CRYPTO_PRO_SIGN_VARIANTS }),
	data: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseCryptoProSign>['argTypes']
