<template>
	<section
		:class="[ui('root'), variantClass, classes.root, { 'base-crypto-pro-sign--disabled': isDisabled }]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:aria-label="regionLabel"
		:aria-busy="isBusy || status.state === 'checking'">
		<BaseCryptoProSignStatus
			:class="ui('status')"
			:status="status"
			:steps="steps"
			:help="statusHelp"
			:versions-text="versionsText"
			:is-disabled="isDisabled"
			@retry="refresh" />
		<template v-if="isReady">
			<template v-if="!isVerify">
				<p v-if="hasNoCertificates" :class="ui('empty')">
					{{ UI_CRYPTOPRO.NO_CERTIFICATES }}
				</p>
				<BaseSelect
					v-else
					:class="ui('certificate')"
					:model-value="thumbprintValue"
					:options="certificateOptions"
					:label="UI_CRYPTOPRO.CERTIFICATE"
					:placeholder="UI_CRYPTOPRO.CERTIFICATE_PLACEHOLDER"
					:is-disabled="isDisabled || isLoadingCertificates"
					@update:model-value="selectCertificate" />
			</template>
			<template v-if="needsSignature">
				<p v-if="signature" :class="ui('source')">
					{{ UI_CRYPTOPRO.SIGNATURE_GIVEN }}
				</p>
				<BaseFileUpload
					v-else
					accept=".sig,.sgn,.p7s,.p7m,.bin,.txt"
					:label="UI_CRYPTOPRO.SIGNATURE_FILE"
					:is-disabled="isDisabled"
					@change="pickSignature"
					@remove="removeSignature" />
			</template>
			<p v-if="data !== undefined" :class="ui('source')">
				{{ sourceText }}
			</p>
			<BaseFileUpload
				v-else
				:label="needsSignature ? UI_CRYPTOPRO.DOCUMENT_VERIFY : UI_CRYPTOPRO.DOCUMENT"
				:is-multiple="isBatch"
				:is-disabled="isDisabled || isRunning"
				@change="pickFile"
				@remove="removeFile" />
			<p v-if="isBatch && hasHashFiles" :class="ui('hint')">
				{{ hashHint }}
			</p>
			<template v-if="!needsSignature && !isBatch">
				<BaseSegmented
					:model-value="detachedValue"
					:options="detachedOptions"
					:label="UI_CRYPTOPRO.TYPE"
					:is-disabled="isDisabled"
					@update:model-value="selectDetached" />
				<p v-if="isHash" :class="ui('hint')">
					{{ hashHint }}
				</p>
			</template>
			<BaseProgress v-if="progress !== null && !isBatch" :value="progressPercent" :aria-label="UI_CRYPTOPRO.HASHING" has-label />
			<BaseProgress v-if="isRunning" :value="batchPercent" :aria-label="UI_CRYPTOPRO.BATCH_PROGRESS" has-label />
			<BaseCryptoProSignBatch
				v-if="isBatch && batchItems.length"
				:class="ui('batch')"
				:items="batchItems"
				:has-download="hasDownload"
				@download="downloadItem" />
			<div :class="ui('actions')">
				<BaseButton :is-loading="isBusy" :is-disabled="!canRun" @click="run">
					{{ runLabel }}
				</BaseButton>
				<BaseButton v-if="isRunning" variant="outline" :is-disabled="isCancelling" @click="cancel">
					{{ UI_CRYPTOPRO.BATCH_CANCEL }}
				</BaseButton>
				<BaseButton v-if="signResult && hasDownload && !isVerify && !isBatch" variant="outline" @click="download">
					<template #left>
						<BaseIcon name="download" />
					</template>
					{{ UI_CRYPTOPRO.DOWNLOAD }}
				</BaseButton>
				<BaseButton v-if="isBatch && hasBatchDownload && hasDownload && !isRunning" variant="outline" @click="downloadAll">
					<template #left>
						<BaseIcon name="download" />
					</template>
					{{ UI_CRYPTOPRO.BATCH_DOWNLOAD_ALL }}
				</BaseButton>
			</div>
			<BaseCryptoProSignResult
				:class="ui('result')"
				:sign-result="isVerify ? null : signResult"
				:verify-result="isVerify ? verifyResult : null" />
		</template>
		<div :class="[ui('error'), { 'base-crypto-pro-sign__error--open': actionError }]">
			<div class="base-crypto-pro-sign__error-body">
				<BaseAlert v-if="actionError" type="error" :title="actionError.message" :description="actionError.detail" />
			</div>
		</div>
		<p :class="ui('live')" role="status">
			{{ announcement }}
		</p>
	</section>
</template>

<script setup lang="ts">
import '../styles/BaseCryptoProSign.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { UI_CRYPTOPRO } from '@/locales/messages'
import { BaseAlert } from '@components/BaseAlert'
import { BaseButton } from '@components/BaseButton'
import { BaseSelect } from '@components/BaseSelect'
import { BaseProgress } from '@components/BaseProgress'
import { BaseSegmented } from '@components/BaseSegmented'
import { BaseFileUpload } from '@components/BaseFileUpload'
import { kitDefaults } from '@composables/base/useDefaults'
import BaseCryptoProSignBatch from './BaseCryptoProSignBatch.vue'
import BaseCryptoProSignResult from './BaseCryptoProSignResult.vue'
import BaseCryptoProSignStatus from './BaseCryptoProSignStatus.vue'
import { useBaseCryptoProSign } from '../model/useBaseCryptoProSign'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseCryptoProSignEmits, BaseCryptoProSignProps, BaseCryptoProSignExpose } from '../types/BaseCryptoProSign.types'

const props = withDefaults(
	defineProps<BaseCryptoProSignProps>(),
	kitDefaults('BaseCryptoProSign', {
		variant: DEFAULT_VARIANT,
		mode: 'sign',
		fileName: '',
		signature: '',
		detached: false,
		level: 'bes',
		tsaAddress: '',
		hashThreshold: 10 * 1024 * 1024,
		scriptUrl: undefined,
		timeout: 30000,
		hasDownload: true,
		isMultiple: false,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCryptoProSignEmits>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	regionLabel,
	status,
	steps,
	statusHelp,
	versionsText,
	isReady,
	isVerify,
	needsSignature,
	isBatch,
	hasHashFiles,
	batchItems,
	batchPercent,
	isRunning,
	isCancelling,
	hasBatchDownload,
	downloadItem,
	downloadAll,
	cancel,
	signAll,
	run,
	runLabel,
	hasNoCertificates,
	thumbprintValue,
	certificateOptions,
	isLoadingCertificates,
	selectCertificate,
	sourceText,
	pickFile,
	removeFile,
	pickSignature,
	removeSignature,
	detachedValue,
	detachedOptions,
	selectDetached,
	isHash,
	hashHint,
	progress,
	progressPercent,
	isBusy,
	canRun,
	sign,
	verify,
	download,
	signResult,
	verifyResult,
	actionError,
	announcement,
	refresh,
} = useBaseCryptoProSign(props, emit)

defineExpose<BaseCryptoProSignExpose>({ check: refresh, sign, signAll, cancel, verify })
</script>
