<template>
	<Transition name="base-crypto-pro-sign-slide" mode="out-in">
		<div v-if="signResult" key="signed" class="base-crypto-pro-sign-result base-crypto-pro-sign-result--valid">
			<BaseIcon class="base-crypto-pro-sign-result__icon" name="check-circle" />
			<span class="base-crypto-pro-sign-result__title">{{ signedText }}</span>
		</div>
		<div
			v-else-if="verifyResult"
			key="verified"
			class="base-crypto-pro-sign-result"
			:class="verifyResult.isValid ? 'base-crypto-pro-sign-result--valid' : 'base-crypto-pro-sign-result--invalid'">
			<BaseIcon class="base-crypto-pro-sign-result__icon" :name="verifyResult.isValid ? 'check-circle' : 'x-circle'" />
			<div class="base-crypto-pro-sign-result__body">
				<span class="base-crypto-pro-sign-result__title">{{ verifyTitle }}</span>
				<span v-if="verifyResult.error" class="base-crypto-pro-sign-result__detail">
					{{ verifyResult.error.detail || verifyResult.error.message }}
				</span>
				<ul v-if="signers.length" class="base-crypto-pro-sign-result__signers">
					<li v-for="signer in signers" :key="signer.key" class="base-crypto-pro-sign-result__signer">
						<span class="base-crypto-pro-sign-result__name">{{ signer.name }}</span>
						<span v-for="line in signer.lines" :key="line" class="base-crypto-pro-sign-result__line">
							{{ line }}
						</span>
					</li>
				</ul>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { useBaseCryptoProSignResult } from '../model/useBaseCryptoProSignResult'
import type { BaseCryptoProSignResultProps } from '../types/BaseCryptoProSignParts.types'

const props = defineProps<BaseCryptoProSignResultProps>()

const { signedText, verifyTitle, signers } = useBaseCryptoProSignResult(props)
</script>
