/** Гант диаграммасының қазақша жолдары (BaseGantt) */
export const kkGantt = {
	gantt: {
		LABEL: 'Гант диаграммасы',
		TASK_COLUMN: 'Тапсырма',
		TIMELINE: 'Уақыт шкаласы',
		LOADING: 'Тапсырмалар жүктелуде',
		EMPTY: 'Тапсырма жоқ',
		TASK_LABEL: '{name}: {start} — {end}, {progress} %',
		MILESTONE_LABEL: '{name}: {date}, маңызды кезең',
		DEPENDENCIES: 'Тәуелді: {list}',
		DEPENDENCY_ITEM: '«{name}» ({type})',
		DEPENDENCY_FS: 'аяқталуы — басталуы',
		DEPENDENCY_SS: 'басталуы — басталуы',
		DEPENDENCY_FF: 'аяқталуы — аяқталуы',
		DEPENDENCY_SF: 'басталуы — аяқталуы',
		EDIT_HINT: 'Көрсеткілер тапсырманы жылжытады, Shift пен көрсеткілер ұзақтығын өзгертеді, Escape жолға қайтарады',
		MOVED: '«{name}» тапсырмасы жылжытылды: {start} — {end}',
		RESIZED: '«{name}» тапсырмасының ұзақтығы: {duration}, {start} — {end}',
		MILESTONE_MOVED: '«{name}» маңызды кезеңі жылжытылды: {date}',
		WARN_DUPLICATE_ID: 'BaseGantt: id «{id}» қайталанады — екінші тапсырма өткізіліп жіберілді',
		WARN_BAD_DATE: 'BaseGantt: «{id}» тапсырмасында басталу немесе аяқталу күні дұрыс емес — тапсырма өткізіліп жіберілді',
		WARN_BAD_RANGE: 'BaseGantt: «{id}» тапсырмасының аяқталуы басталуынан бұрын — аяқталуы басталуына теңестірілді',
		WARN_BAD_PARENT: 'BaseGantt: «{id}» тапсырмасының «{parentId}» ата-анасы жоқ — тапсырма жоғарғы деңгейде көрсетілді',
		WARN_PARENT_CYCLE: 'BaseGantt: «{id}» тапсырмасының parentId мәні цикл жасайды — тапсырма жоғарғы деңгейде көрсетілді',
		WARN_BAD_DEPENDENCY: 'BaseGantt: «{id}» тапсырмасының «{dependencyId}» тапсырмасына тәуелділігі еленбейді — мұндай тапсырма жоқ',
		WARN_EMPTY_DEPENDENCY:
			'BaseGantt: «{id}» тапсырмасының dependencies ішінде бос мән (null немесе undefined) бар — ол өткізіліп жіберілді',
		WARN_BAD_DEPENDENCY_TYPE:
			'BaseGantt: «{id}» тапсырмасының «{dependencyId}» тапсырмасымен байланысының «{type}» түрі белгісіз — «FS» қабылданды',
		WARN_DEPENDENCY_CYCLE: 'BaseGantt: «{id}» тапсырмасының «{dependencyId}» тапсырмасына тәуелділігі еленбейді — ол цикл жасайды',
	},
}
