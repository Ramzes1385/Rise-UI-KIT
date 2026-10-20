import { describeLibraryModel } from '../../libraryChecks'
import { buildUser } from '../../../../models/library/clients/user'

describeLibraryModel('user', buildUser, { parts: ['body', 'accent', 'detail', 'light'], animations: ['pulse'], anchorY: 1.22 })
