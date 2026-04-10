import * as functions from 'firebase-functions/v1';

/**
 * Runs when a Firebase Auth user is created.
 *
 * We intentionally do NOT create a Firestore user doc here.
 * The client app creates it during registration with the full profile
 * (role, graduationYear, etc.). Creating it here would race with the
 * client write, and Firestore security rules block the client from
 * overwriting fields like `createdAt` and `role`: causing the client
 * write to fail silently and leaving the doc without a graduationYear.
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  functions.logger.info(`Auth user created: ${user.uid} (${user.email})`);
});
