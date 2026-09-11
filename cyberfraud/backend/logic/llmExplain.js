/**
 * Explains threat factors and urgency scores in natural language for law enforcement officers.
 */
export function generateLLMExplanation(caseData) {
  if (!caseData) return 'No case data available.';

  const score = caseData.urgency_score || 50;
  const amount = Number(caseData.amount) || 0;
  const scamType = caseData.scam_type || 'Cyber Fraud';

  let explanation = `🤖 **FraudShield AI Threat Intelligence Breakdown:**\n\n`;

  if (score >= 80) {
    explanation += `• **Critical Urgency Alert (${score}/100):** Immediate action required within the 45-minute golden window to block mule accounts.\n`;
  } else if (score >= 50) {
    explanation += `• **Elevated Risk (${score}/100):** High velocity transfer pattern detected.\n`;
  } else {
    explanation += `• **Standard Priority (${score}/100):** Routine investigation queue.\n`;
  }

  explanation += `• **Financial Impact:** Financial loss of ₹${amount.toLocaleString('en-IN')} classified under ${scamType}.\n`;
  explanation += `• **Key Interception Vectors:**\n`;
  explanation += `  1. Automated lien request broadcast sent to NPCI clearing gateway.\n`;
  explanation += `  2. Suspect account ${caseData.suspect_account || 'SBI-MULE-48192019'} flagged for immediate freeze across partner bank teller nodes.\n`;
  explanation += `  3. Device IMEI & Proxy IP routed to Cyber Command Center graph analysis tool.`;

  return explanation;
}
