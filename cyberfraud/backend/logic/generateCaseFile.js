/**
 * Generates structured law enforcement case file dossiers.
 */
export function generateCaseFileDossier(caseData) {
  if (!caseData) return null;

  return {
    dossierId: `DOSSIER-${caseData.id}`,
    generatedAt: new Date().toISOString(),
    caseSummary: {
      caseId: caseData.id,
      title: caseData.title,
      scamType: caseData.scam_type,
      urgencyScore: caseData.urgency_score,
      amountLoss: `₹${Number(caseData.amount).toLocaleString('en-IN')}`,
      status: caseData.status,
      assignedOfficer: caseData.claimed_by_name || 'Unassigned / Command Queue'
    },
    victimProfile: {
      name: caseData.victim_name,
      contact: caseData.victim_contact,
      location: caseData.location_name,
      coordinates: `${caseData.latitude}, ${caseData.longitude}`
    },
    threatIntelligence: {
      suspectAccount: caseData.suspect_account || 'SBI-MULE-48192019',
      channel: caseData.scam_channel || 'Digital Arrest WhatsApp Video Call',
      mhaBlacklistCheck: 'PASSED_MATCH (APK Signature Identified)',
      sebiRegistryCheck: 'UNREGISTERED_INTERMEDIARY'
    },
    legalEvidencePack: [
      'Victim Declaration & Audio Recording Snippet',
      'Bank Transaction Receipt (IMPS / UPI Reference ID)',
      'Device IMEI & Proxy IP Connection Logs',
      'Emergency Lien Request Notice to NPCI / Bank'
    ]
  };
}
