import * as admin from 'firebase-admin';

admin.initializeApp();

export { onUserCreate } from './onUserCreate';
export { syncCohortMembership } from './syncCohortMembership';
export { onReportCreate } from './onReportCreate';
export { approveContent } from './approveContent';
export { suspendUser } from './suspendUser';

// Admin portal MVP
export { getDashboardStats } from './getDashboardStats';
export { getPendingContent } from './getPendingContent';
export { getReports } from './getReports';
export { getUsers } from './getUsers';
export { updateReportStatus } from './updateReportStatus';
export { createOfficialEvent } from './createOfficialEvent';
export { editEvent } from './editEvent';
export { deleteEvent } from './deleteEvent';

// Smart Match discovery
export { getDiscoveryResults } from './getDiscoveryResults';
export { getGroupDiscoveryResults } from './getGroupDiscoveryResults';
export { joinGroup } from './joinGroup';
export { leaveGroup } from './leaveGroup';
