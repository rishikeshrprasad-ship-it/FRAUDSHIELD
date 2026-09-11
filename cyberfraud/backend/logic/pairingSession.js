/**
 * Bank teller to victim pairing session manager for duress verification.
 */
const activePairings = new Map();

export function createPairingSession(branchId, tellerId) {
  const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
  const session = {
    sessionId: `PAIR-${Date.now()}`,
    pairingCode,
    branchId,
    tellerId,
    status: 'WAITING_FOR_VICTIM',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 600000).toISOString() // 10 mins
  };

  activePairings.set(pairingCode, session);
  return session;
}

export function verifyPairingCode(pairingCode, victimContact) {
  const session = activePairings.get(pairingCode);
  if (!session) {
    return { success: false, message: 'Invalid or expired pairing code' };
  }

  session.status = 'PAIRED_SUCCESSFUL';
  session.victimContact = victimContact;
  session.pairedAt = new Date().toISOString();

  return {
    success: true,
    session,
    message: 'Teller & Victim successfully paired for live duress verification.'
  };
}
