<template>
	<ul class="base-crypto-pro-sign-batch" :aria-label="UI_CRYPTOPRO.BATCH_LIST">
		<li
			v-for="view in views"
			:key="view.id"
			class="base-crypto-pro-sign-batch__item"
			:class="`base-crypto-pro-sign-batch__item--${view.status}`">
			<BaseIcon v-if="view.icon" class="base-crypto-pro-sign-batch__icon" :name="view.icon" />
			<span v-else class="base-crypto-pro-sign-batch__dot" aria-hidden="true" />
			<span class="base-crypto-pro-sign-batch__name">{{ view.name }}</span>
			<span class="base-crypto-pro-sign-batch__meta">{{ view.meta }}</span>
			<BaseButton
				v-if="view.canDownload && hasDownload"
				variant="ghost"
				:aria-label="view.downloadLabel"
				@click="emit('download', view.id)">
				<template #left>
					<BaseIcon name="download" />
				</template>
			</BaseButton>
			<BaseProgress
				v-if="view.percent !== null"
				class="base-crypto-pro-sign-batch__progress"
				:value="view.percent"
				:aria-label="UI_CRYPTOPRO.HASHING"
				has-label />
			<span v-if="view.error" class="base-crypto-pro-sign-batch__error">{{ view.error }}</span>
		</li>
	</ul>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { UI_CRYPTOPRO } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { BaseProgress } from '@components/BaseProgress'
import { useBaseCryptoProSignBatch } from '../model/signing/useBaseCryptoProSignBatch'
import type { BaseCryptoProSignBatchEmits, BaseCryptoProSignBatchProps } from '../types/BaseCryptoProSignParts.types'

const props = defineProps<BaseCryptoProSignBatchProps>()

const emit = defineEmits<BaseCryptoProSignBatchEmits>()

const { views } = useBaseCryptoProSignBatch(props)
</script>
