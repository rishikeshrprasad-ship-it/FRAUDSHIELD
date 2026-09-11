/**
 * Intercepts bank account freezes via NPCI / APBS integration stubs.
 */
export function triggerBankFreeze(accountNo, bankName, caseId, requestedBy) {
  const referenceId = `NPCI-FREEZE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    success: true,
    referenceId,
    accountNo,
    bankName: bankName || 'Mule Beneficiary Bank',
    caseId,
    timestamp: new Date().toISOString(),
    status: 'LIEN_MARKED_SUCCESSFUL',
    holdAmount: 'FULL_BALANCE_LIEN',
    npciResponseCode: 'APBS_00_SUCCESS',
    details: `Emergency lien placed on account ${accountNo} across NPCI clearing network upon police request by ${requestedBy}.`
  };
}
