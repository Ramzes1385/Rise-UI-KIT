/** Нотация C4 BaseFlowMap: виды, правила, предупреждения */
export const kkFlowC4 = {
	flowC4: {
		NOTATION: 'C4',
		RULES_SUMMARY: 'әрбір байланыс белгіленеді; шекараларда контейнерлер мен компоненттер болады; адамдар шекарадан тыс тұрады',
		PERSON: 'Адам',
		SOFTWARE_SYSTEM: 'Бағдарламалық жүйе',
		CONTAINER: 'Контейнер',
		COMPONENT: 'Компонент',
		EXTERNAL_PERSON: 'Сыртқы адам',
		EXTERNAL_SYSTEM: 'Сыртқы жүйе',
		ENTERPRISE_BOUNDARY: 'Кәсіпорын шекарасы',
		SYSTEM_BOUNDARY: 'Жүйе шекарасы',
		CONTAINER_BOUNDARY: 'Контейнер шекарасы',
		RELATIONSHIP: 'Байланыс',
		PROP_TECHNOLOGY: 'Технология',
		CARD_LINE: '[{kind}: {technology}]',
		CARD_LINE_PLAIN: '[{kind}]',
		RULE_CONTAIN: '«{group}» ішіне тек мыналарды қоюға болады: {kinds}',
		WARN_NO_LABEL: '«{source}» → «{target}» байланысында белгі жоқ: C4-тегі әрбір сызық белгіленеді',
	},
}
