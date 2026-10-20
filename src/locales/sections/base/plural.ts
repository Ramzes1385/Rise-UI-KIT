/** Утилиты: раздел словаря — Общие подписи, доступные имена, предупреждения */

import { localized } from '../../localized'
import { ruPlural } from '../../ru/rules/plural'

/** Формы слов для чисел (`pluralize`): `pluralize(UI_PLURAL.DAYS, 3)` */
export const UI_PLURAL = /* @__PURE__ */ localized('plural', ruPlural)
