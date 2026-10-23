/**
 * История «Анимации» (`Animations`): кнопка «Повторить» и одна и та же разметка в колонках четырёх пресетов движения.
 * Шаблон с обёртками `data-rise-motion` общий для превью и «Show code» — код показывает ровно то, что на экране.
 */

import { storySource } from '../code/source'
import { useStorySetup } from '../../controls/model'
import type { MotionPresetsStoryOptions } from '../../types/helpers.types'
import { MOTION_PRESETS } from '@composables/app/useMotion/types/useMotion.types'
import type { MotionPreset } from '@composables/app/useMotion/types/useMotion.types'

const PRESET_LABELS: Record<MotionPreset, string> = {
	none: 'none — без движения',
	subtle: 'subtle — сдержанно',
	standard: 'standard — по умолчанию',
	expressive: 'expressive — выразительно',
}

/** Разметка колонки с общим отступом шаблона: свой отступ строк `item` снимается */
function indent(markup: string, tabs: string): string {
	const lines = markup.split('\n').filter(line => line.trim())
	const common = Math.min(...lines.map(line => /^\t*/.exec(line)![0].length))
	return lines.map(line => `${tabs}${line.slice(common)}`).join('\n')
}

function presetColumn(preset: MotionPreset, item: string): string {
	return [
		`\t\t<div class="story-motion__preset" data-rise-motion="${preset}">`,
		`\t\t\t<span class="story-label">${PRESET_LABELS[preset]}</span>`,
		indent(item.replaceAll('%preset%', preset), '\t\t\t'),
		'\t\t</div>',
	].join('\n')
}

const STEP_PREFIX = 'Следующий шаг: '
const REPEAT_LABEL = 'Повторить'

/** Кнопка истории: «Следующий шаг: <подпись>» по шагам и «Повторить» после последнего, либо одно действие */
function triggerMarkup(options: Pick<MotionPresetsStoryOptions, 'steps' | 'action' | 'trigger'>): string {
	if (options.steps) {
		const label = `step < steps.length ? '${STEP_PREFIX}' + steps[step] : '${REPEAT_LABEL}'`
		return `\t<BaseButton variant="outline" @click="step = step < steps.length ? step + 1 : 0">{{ ${label} }}</BaseButton>`
	}
	const { action = 'replay++', trigger = REPEAT_LABEL } = options
	return `\t<BaseButton variant="outline" @click="${action}">${trigger}</BaseButton>`
}

/** Шаблон истории: кнопка и колонки пресетов `none`, `subtle`, `standard`, `expressive` */
function motionPresetsTemplate(options: Pick<MotionPresetsStoryOptions, 'item' | 'steps' | 'action' | 'trigger'>): string {
	return [
		'',
		'<div class="story-motion">',
		triggerMarkup(options),
		'\t<div class="story-motion__presets">',
		...MOTION_PRESETS.map(preset => presetColumn(preset, options.item)),
		'\t</div>',
		'</div>',
		'',
	].join('\n')
}

/**
 * `render` и `docs.source` истории «Анимации».
 *
 * @example
 * const motion = motionPresetsStory({
 *   item: '<BaseAnimation :key="replay" v-bind="args"><div class="story-frame">Карточка</div></BaseAnimation>',
 *   components: { BaseAnimation, BaseButton },
 *   imports: ['BaseAnimation'],
 * })
 * export const Animations = { render: motion.render, parameters: { docs: { source: motion.source } } }
 */
export function motionPresetsStory(options: MotionPresetsStoryOptions) {
	const template = motionPresetsTemplate(options)
	const state = options.steps ? { step: 0, steps: options.steps, ...options.state } : { replay: 0, ...options.state }
	return {
		template,
		render: <TArgs extends object>(args: TArgs) => ({
			components: options.components,
			setup: useStorySetup(args, { state, slots: options.slots }),
			template,
		}),
		source: storySource({ template, imports: ['BaseButton', ...options.imports], state, omit: options.omit }),
	}
}
