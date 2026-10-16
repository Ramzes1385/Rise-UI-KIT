import { toHalfWidth } from '@utils/data/textUtils'
import type { RequisiteKind, RequisiteRule } from '../../types/BaseRequisiteInput.types'
import {
	isValidAccount,
	isValidBik,
	isValidCorrespondentAccount,
	isValidInn,
	isValidKpp,
	isValidOgrn,
	isValidSnils,
} from '@utils/data/requisiteUtils'

export const REQUISITE_RULES: Record<RequisiteKind, RequisiteRule> = {
	inn: { mask: '############', lengths: [10, 12], check: isValidInn },
	kpp: { mask: '####**###', lengths: [9], check: isValidKpp },
	ogrn: { mask: '#############', lengths: [13], check: isValidOgrn },
	ogrnip: { mask: '###############', lengths: [15], check: isValidOgrn },
	bik: { mask: '#########', lengths: [9], check: isValidBik },
	account: { mask: '####################', lengths: [20], check: isValidAccount },
	correspondentAccount: { mask: '####################', lengths: [20], check: isValidCorrespondentAccount },
	snils: { mask: '###-###-### ##', lengths: [11], check: isValidSnils },
}

export const cleanRequisite = (text: string, kind: RequisiteKind): string =>
	kind === 'kpp'
		? toHalfWidth(text)
				.toUpperCase()
				.replace(/[^\dA-Z]/g, '')
		: toHalfWidth(text).replace(/\D/g, '')
