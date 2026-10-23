<template>
	<BaseModal
		:custom-class="{ root: 'base-media-player__report' }"
		:is-open="isOpen"
		:title="UI_PLAYER.REPORT_TITLE"
		is-contained
		@update:is-open="close">
		<div class="base-media-player__report-form">
			<BaseRadio v-model="reason" name="media-report-reason" :options="reasonOptions" :label="UI_PLAYER.REPORT" />
			<BaseTextarea v-model="comment" :label="UI_PLAYER.REPORT_COMMENT" :rows="2" :maxlength="1000" />
		</div>
		<template #footer>
			<BaseButton variant="ghost" @click="close">{{ UI_TEXT.CANCEL }}</BaseButton>
			<BaseButton @click="submit">{{ UI_PLAYER.REPORT_SEND }}</BaseButton>
		</template>
	</BaseModal>
</template>

<script setup lang="ts">
import { BaseModal } from '@components/BaseModal'
import { BaseRadio } from '@components/BaseRadio'
import { BaseButton } from '@components/BaseButton'
import { BaseTextarea } from '@components/BaseTextarea'
import { UI_PLAYER, UI_TEXT } from '../../model/messages'
import { useMediaReportForm } from '../../model/panels/useMediaReportForm'
import type { MediaReportFormEmits, MediaReportFormProps } from '../../types/panels/MediaReportForm.types'

const props = defineProps<MediaReportFormProps>()
const emit = defineEmits<MediaReportFormEmits>()

const { reason, comment, isOpen, reasonOptions, close, submit } = useMediaReportForm(props, emit)
</script>
