export { TEXT_DIFF_MODES, TEXT_DIFF_PARTS, TEXT_DIFF_VARIANTS } from './types/BaseTextDiff.types'
export type {
	BaseTextDiffPart,
	BaseTextDiffProps,
	TextDiffChange,
	TextDiffLine,
	TextDiffMode,
	TextDiffPart,
	TextDiffRow,
} from './types/BaseTextDiff.types'
export { diffLines, diffWords, splitRows } from './model/diff/textDiff'
export { default as BaseTextDiff } from './ui/BaseTextDiff.vue'
