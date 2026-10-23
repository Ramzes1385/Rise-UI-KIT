import { describeLibraryModel } from '../../libraryChecks'
import { buildScroll } from '../../../../models/library/data/scroll'

describeLibraryModel('scroll', buildScroll, { parts: ['body', 'accent', 'detail'], animations: ['flow'], anchorY: 0.5 })
