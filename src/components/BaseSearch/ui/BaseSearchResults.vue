<template>
	<slot name="results" :results="visibleResults" :query="query" :is-loading="isLoading">
		<slot v-if="isLoading" name="loading">
			<Transition v-if="visibleResults.length === 0" name="base-search-state" appear :css="!isMotionReduced">
				<div :class="ui('status')" role="status" v-bind="motionAttrs">
					<BaseText tag="span" :size-scale="sizeScale">{{ UI_TEXT.LOADING }}</BaseText>
				</div>
			</Transition>
		</slot>
		<slot name="result-before" :results="visibleResults" :query="query" />
		<Transition v-if="visibleResults.length > 0" name="base-search-state" appear :css="!isMotionReduced">
			<div :id="listboxId" :class="ui('listbox')" role="listbox" :aria-label="listboxLabel" v-bind="motionAttrs">
				<div
					v-for="(item, index) in visibleResults"
					:id="listboxId ? getSearchOptionId(listboxId, index) : undefined"
					:key="item.id"
					:class="[ui('result'), { 'base-search__result--highlighted': index === highlightedIndex }, classes.result]"
					role="option"
					:aria-selected="index === highlightedIndex ? 'true' : 'false'"
					@mousedown.prevent="handleSelect(item)"
					@mouseenter="handleHighlight(index)">
					<slot name="result" :item="item" :index="index">
						<BaseImage
							v-if="item.image"
							:src="item.image"
							:alt="item.title"
							:class="ui('result-image')"
							:custom-class="classes.resultImage"
							fit="cover"
							:size-scale="sizeScale" />
						<BaseIcon
							v-else-if="item.icon"
							:name="item.icon"
							:class="ui('result-icon')"
							:custom-class="classes.resultIcon"
							:size-scale="calcIconScale('sm', sizeScale)" />
						<div :class="[ui('result-content'), classes.resultContent]">
							<BaseText tag="span" :class="ui('result-title')" :custom-class="classes.resultTitle" :size-scale="sizeScale">
								<template v-for="(part, partIndex) in splitByQuery(item.title)" :key="partIndex">
									<mark v-if="part.isMatch" :class="ui('match')">{{ part.text }}</mark>
									<template v-else>{{ part.text }}</template>
								</template>
							</BaseText>
							<BaseText
								v-if="item.description"
								tag="span"
								:class="ui('result-desc')"
								:custom-class="classes.resultDesc"
								:size-scale="sizeScale">
								<template v-for="(part, partIndex) in splitByQuery(item.description)" :key="partIndex">
									<mark v-if="part.isMatch" :class="ui('match')">{{ part.text }}</mark>
									<template v-else>{{ part.text }}</template>
								</template>
							</BaseText>
						</div>
						<BaseText
							v-if="item.category"
							tag="span"
							:class="ui('result-category')"
							:custom-class="classes.resultCategory"
							:size-scale="sizeScale">
							{{ item.category }}
						</BaseText>
					</slot>
				</div>
			</div>
		</Transition>
		<template v-else-if="query && !isLoading">
			<slot name="empty">
				<Transition name="base-search-state" appear :css="!isMotionReduced">
					<div :class="[ui('empty'), classes.empty]" v-bind="motionAttrs">
						<BaseText :custom-class="classes.emptyText" :size-scale="sizeScale">{{ UI_TEXT.NO_RESULTS }}</BaseText>
					</div>
				</Transition>
			</slot>
		</template>
		<slot name="result-after" :results="visibleResults" :query="query" />
	</slot>
</template>

<script setup lang="ts">
import { UI_TEXT } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseText } from '@components/BaseText'
import { BaseImage } from '@components/BaseImage'
import { calcIconScale } from '@utils/media/iconUtils'
import { getSearchOptionId } from '../model/searchOptionId'
import { useBaseSearchResults } from '../model/useBaseSearchResults'
import type { BaseSearchResultsEmits, BaseSearchResultsProps, BaseSearchResultsSlots } from '../types/BaseSearchResults.types'

const props = defineProps<BaseSearchResultsProps>()

const emit = defineEmits<BaseSearchResultsEmits>()

defineSlots<BaseSearchResultsSlots>()

const { splitByQuery, handleSelect, handleHighlight } = useBaseSearchResults(props, emit)
</script>
