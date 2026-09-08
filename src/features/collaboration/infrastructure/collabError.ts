export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
} as const;

export type OperationType = typeof OperationType[keyof typeof OperationType];

export interface ApiErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errMsg = error instanceof Error ? error.message : String(error);
  const isPermissionError = errMsg.toLowerCase().includes('permission') || errMsg.toLowerCase().includes('insufficient') || errMsg.toLowerCase().includes('401') || errMsg.toLowerCase().includes('403');

  const errInfo: ApiErrorInfo = {
    error: errMsg,
    operationType,
    path,
  };

  if (isPermissionError) {
    console.warn(`[API Fallback] ${operationType} on ${path} failed due to permissions. Local cache is active:`, errMsg);
  } else {
    console.error('[API Error]: ', JSON.stringify(errInfo));
  }
  throw new Error(JSON.stringify(errInfo));
}

