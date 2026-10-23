<template>
	<Transition name="base-cookie-consent">
		<div
			v-if="isVisible"
			ref="rootRef"
			role="region"
			:aria-label="label"
			:aria-labelledby="label ? undefined : titleId"
			:aria-describedby="descriptionId"
			:class="[
				ui('root'),
				`base-cookie-consent--${position}`,
				{ 'base-cookie-consent--contained': isContained },
				variantClass,
				classes.root,
			]"
			:style="[sizeScaleStyle, variantStyle, customColorStyle]">
			<div :class="[ui('content'), classes.content]">
				<BaseText
					:id="titleId"
					tag="h2"
					:weight="TEXT_WEIGHT.SEMIBOLD"
					:size-scale="sizeScale"
					:class="ui('title')"
					:custom-class="classes.title">
					{{ consentTitle }}
				</BaseText>

				<BaseText
					:id="descriptionId"
					tag="p"
					:size-scale="sizeScale"
					:class="ui('description')"
					:custom-class="classes.description">
					<slot>{{ consentDescription }}</slot>
				</BaseText>
			</div>

			<div
				v-if="isSettingsShown && categories.length"
				:id="settingsId"
				role="group"
				:aria-label="UI_COOKIE_CONSENT.CATEGORIES"
				:class="[ui('settings'), classes.settings]">
				<div v-for="category in categories" :key="category.id" :class="[ui('category'), classes.category]">
					<BaseSwitch
						:model-value="category.isRequired || isChecked(category.id)"
						:label="category.label"
						:is-disabled="category.isRequired"
						:size-scale="sizeScale"
						:input-attrs="{ 'aria-describedby': categoryDescriptionId(category.id) }"
						@update:model-value="toggle(category.id, $event)" />
					<BaseText
						:id="categoryDescriptionId(category.id)"
						tag="p"
						:size-scale="sizeScale"
						:class="ui('category-description')"
						:custom-class="classes.categoryDescription">
						{{ category.description }}
						<BaseText
							v-if="category.isRequired"
							tag="span"
							:size-scale="sizeScale"
							:class="ui('hint')"
							:custom-class="classes.hint">
							{{ UI_COOKIE_CONSENT.REQUIRED }}
						</BaseText>
					</BaseText>
				</div>
			</div>

			<div :class="[ui('actions'), classes.actions]">
				<BaseButton
					variant="ghost"
					:size-scale="sizeScale"
					:padding="buttonPadding"
					:aria-expanded="isSettingsShown"
					:aria-controls="isSettingsShown ? settingsId : undefined"
					:class="ui('customize')"
					:custom-class="classes.customize"
					@click="toggleSettings">
					{{ isSettingsShown ? UI_COOKIE_CONSENT.CUSTOMIZE_CLOSE : UI_COOKIE_CONSENT.CUSTOMIZE }}
				</BaseButton>
				<BaseButton
					variant="outline"
					:size-scale="sizeScale"
					:padding="buttonPadding"
					:class="ui('accept-selected')"
					:custom-class="classes.acceptSelected"
					@click="acceptSelected">
					{{ UI_COOKIE_CONSENT.ACCEPT_SELECTED }}
				</BaseButton>
				<BaseButton
					:size-scale="sizeScale"
					:padding="buttonPadding"
					:class="ui('reject-all')"
					:custom-class="classes.rejectAll"
					@click="rejectAll">
					{{ UI_COOKIE_CONSENT.REJECT_ALL }}
				</BaseButton>
				<BaseButton
					:size-scale="sizeScale"
					:padding="buttonPadding"
					:class="ui('accept-all')"
					:custom-class="classes.acceptAll"
					@click="acceptAll">
					{{ UI_COOKIE_CONSENT.ACCEPT_ALL }}
				</BaseButton>
			</div>
		</div>
	</Transition>
</template>

<script setup lang="ts">
import '../styles/BaseCookieConsent.style.scss'
import { BaseButton } from '@components/BaseButton'
import { BaseSwitch } from '@components/BaseSwitch'
import { UI_COOKIE_CONSENT } from '@/locales/messages'
import { kitDefaults } from '@composables/base/useDefaults'
import { BaseText, TEXT_WEIGHT } from '@components/BaseText'
import { useBaseCookieConsent } from '../model/useBaseCookieConsent'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseCookieConsentEmits, BaseCookieConsentProps, BaseCookieConsentSlots } from '../types/BaseCookieConsent.types'

const props = withDefaults(
	defineProps<BaseCookieConsentProps>(),
	kitDefaults('BaseCookieConsent', {
		variant: DEFAULT_VARIANT,
		categories: () => [],
		isOpen: true,
		isSettingsOpen: false,
		position: 'bottom',
		isContained: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseCookieConsentEmits>()
defineSlots<BaseCookieConsentSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isVisible,
	rootRef,
	isSettingsShown,
	isChecked,
	toggle,
	toggleSettings,
	titleId,
	descriptionId,
	settingsId,
	categoryDescriptionId,
	buttonPadding,
	consentTitle,
	consentDescription,
	acceptAll,
	rejectAll,
	acceptSelected,
} = useBaseCookieConsent(props, emit)
</script>
