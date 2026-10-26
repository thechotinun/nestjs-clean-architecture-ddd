/**
Error keys of the todo module. Numeric codes are assigned in src/error-codes.ts.
Each key names a violated business rule or a missing aggregate, in domain language —
never a technical failure (DB/persistence errors are infrastructure and surface as 500).
Add a key together with the exception that throws it.
*/
export const RoleErrorKey = {
	NOT_FOUND: 'ROLE_NOT_FOUND',
	INVALID_NAME: 'INVALID_ROLE_NAME',
	NAME_ALREADY_EXISTS: 'ROLE_NAME_ALREADY_EXISTS',
	GLOBAL_PERMISSION_NOT_ASSIGNABLE: 'GLOBAL_PERMISSION_NOT_ASSIGNABLE',
} as const;
export type RoleErrorKey = (typeof RoleErrorKey)[keyof typeof RoleErrorKey];
