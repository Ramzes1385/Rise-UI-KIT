<template>
	<div class="base-crypto-pro-sign-status">
		<p v-if="status.state === 'ready'" class="base-crypto-pro-sign-status__versions">
			{{ versionsText }}
		</p>
		<template v-else>
			<ul class="base-crypto-pro-sign-status__steps" :aria-label="UI_CRYPTOPRO.CHECKING">
				<li
					v-for="step in steps"
					:key="step.id"
					class="base-crypto-pro-sign-status__step"
					:class="`base-crypto-pro-sign-status__step--${step.state}`">
					<BaseIcon v-if="step.icon" class="base-crypto-pro-sign-status__icon" :name="step.icon" />
					<span v-else class="base-crypto-pro-sign-status__dot" aria-hidden="true" />
					<span class="base-crypto-pro-sign-status__label">{{ step.label }}</span>
					<span class="base-crypto-pro-sign-status__state">{{ step.stateText }}</span>
				</li>
			</ul>
			<BaseAlert v-if="status.error" type="error" :title="status.error.message" :description="help.text">
				<template #actions>
					<BaseLink v-for="link in help.links" :key="link.href" :href="link.href" target="_blank" rel="noopener noreferrer">
						{{ link.label }}
					</BaseLink>
					<BaseButton variant="outline" :is-disabled="isDisabled" @click="emit('retry')">
						{{ UI_CRYPTOPRO.RETRY }}
					</BaseButton>
				</template>
			</BaseAlert>
		</template>
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseLink } from '@components/BaseLink'
import { UI_CRYPTOPRO } from '@/locales/messages'
import { BaseAlert } from '@components/BaseAlert'
import { BaseButton } from '@components/BaseButton'
import type { BaseCryptoProSignStatusEmits, BaseCryptoProSignStatusProps } from '../types/BaseCryptoProSignParts.types'

defineProps<BaseCryptoProSignStatusProps>()

const emit = defineEmits<BaseCryptoProSignStatusEmits>()
</script>
