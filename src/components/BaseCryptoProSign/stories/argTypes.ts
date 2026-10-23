import type { Meta } from '@storybook/vue3-vite'
import type BaseCryptoProSign from '../ui/BaseCryptoProSign.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { CRYPTO_PRO_SIGN_LEVELS, CRYPTO_PRO_SIGN_MODES, CRYPTO_PRO_SIGN_VARIANTS } from '../types/BaseCryptoProSign.types'

export const argTypes = {
	...baseArgTypes({ variants: CRYPTO_PRO_SIGN_VARIANTS }),
	mode: { control: 'inline-radio', options: CRYPTO_PRO_SIGN_MODES, table: propGroup(ARG_GROUP.behavior) },
	data: { control: 'text', table: propGroup(ARG_GROUP.content) },
	fileName: { control: 'text', table: propGroup(ARG_GROUP.content) },
	signature: { control: 'text', table: propGroup(ARG_GROUP.content) },
	thumbprint: { control: 'text', table: propGroup(ARG_GROUP.state) },
	detached: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	level: { control: 'inline-radio', options: CRYPTO_PRO_SIGN_LEVELS, table: propGroup(ARG_GROUP.behavior) },
	tsaAddress: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	hashThreshold: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.behavior) },
	scriptUrl: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	timeout: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.behavior) },
	isMultiple: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	hasDownload: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseCryptoProSign>['argTypes']
