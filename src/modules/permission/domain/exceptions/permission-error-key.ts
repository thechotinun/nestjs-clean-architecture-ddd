/**
Error keys of the permission module. Numeric codes are assigned in src/error-codes.ts.
Each key names a violated business rule or a missing aggregate, in domain language —
never a technical failure (DB/persistence errors are infrastructure and surface as 500).
Add a key together with the exception that throws it.
*/
export const PermissionErrorKey = {
	NOT_FOUND: 'PERMISSION_NOT_FOUND',
	INVALID_NAME: 'INVALID_PERMISSION_NAME',
	INVALID_RESOURCE: 'INVALID_PERMISSION_RESOURCE',
	INVALID_ACTION: 'INVALID_PERMISSION_ACTION',
	ALREADY_EXISTS: 'PERMISSION_ALREADY_EXISTS',
} as const;
export type PermissionErrorKey = (typeof PermissionErrorKey)[keyof typeof PermissionErrorKey];
