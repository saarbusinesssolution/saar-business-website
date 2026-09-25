/**
 * Canonical Project Summary & Export Formatter: SAAR Business Support Solution
 * Formats structured briefs into plain-text summaries, downloadable files,
 * and WhatsApp messages.
 */

import type { ProjectBriefV1 } from '../../types/project-brief';

/**
 * Formats a project brief into a human-readable plain-text summary.
 * Used for clipboard copy, plain-text file download, and future contact handoff.
 */
export function formatBriefText(brief: ProjectBriefV1): string {
  const lines: string[] = [];

  lines.push('====================================================');
  lines.push('SAAR BUSINESS SUPPORT SOLUTION — PROJECT BRIEF');
  lines.push('Architectural Interiors & Turnkey Contracting');
  lines.push('Website: https://saarbusiness.com');
  lines.push(`Generated: ${new Date(brief.timestamp).toLocaleDateString('en-IN', { dateStyle: 'long' })}`);
  lines.push('====================================================\n');

  lines.push('1. SPACE TYPOLOGY');
  lines.push(`   Category:        ${brief.space.categoryLabel}`);
  lines.push(`   Property Type:   ${brief.space.propertyTypeLabel}`);
  if (brief.space.customDescription) {
    lines.push(`   Typology Notes:  ${brief.space.customDescription}`);
  }
  lines.push('');

  lines.push('2. SERVICES REQUIRED');
  if (brief.requirements.isGuidanceOnly) {
    lines.push('   Scope:           Guidance Requested (Assessing Design vs. Turnkey)');
  } else {
    lines.push(`   Selected:        ${brief.requirements.serviceLabels.join(', ')}`);
  }
  if (brief.requirements.additionalNotes) {
    lines.push(`   Notes:           ${brief.requirements.additionalNotes}`);
  }
  lines.push('');

  lines.push('3. PROJECT LOCATION & STAGE');
  lines.push(`   Locality/City:   ${brief.details.locality}`);
  if (brief.details.approximateArea) {
    lines.push(`   Approx. Area:    ${brief.details.approximateArea} ${brief.details.areaUnit}`);
  } else {
    lines.push('   Approx. Area:    Not specified');
  }
  lines.push(`   Current Stage:   ${brief.details.stageLabel}`);
  lines.push('');

  lines.push('4. PREFERENCES (VISITOR EXPECTATIONS)');
  if (brief.preferences.skipped) {
    lines.push('   Preferences:     Skipped during planning (Open to recommendations)');
  } else {
    lines.push(`   Style Direction: ${brief.preferences.stylePreference || 'Not specified'}`);
    lines.push(`   Budget Horizon:  ${brief.preferences.budgetExpectation || 'Not specified'} (Visitor Expectation)`);
    lines.push(`   Target Timing:   ${brief.preferences.desiredTiming || 'Not specified'}`);
  }
  lines.push('');

  lines.push('----------------------------------------------------');
  lines.push('IMPORTANT NOTICE & SCOPE DISCLAIMER:');
  lines.push('This summary represents the visitor’s self-reported requirements.');
  lines.push('It is not a formal quotation, feasibility sign-off, or contractual');
  lines.push('agreement. Creating this brief does not submit an enquiry to SAAR.');
  lines.push('To discuss this space, please contact SAAR directly.');
  lines.push('----------------------------------------------------');

  return lines.join('\n');
}

/**
 * Prepares a concise WhatsApp message starting with the mandatory intro.
 */
export function formatWhatsAppMessage(brief: ProjectBriefV1): string {
  const parts: string[] = [];

  parts.push('Hello SAAR, I would like to discuss this project.');
  parts.push('');
  parts.push(`*Space:* ${brief.space.categoryLabel} (${brief.space.propertyTypeLabel})`);
  parts.push(`*Location:* ${brief.details.locality}`);
  if (brief.details.approximateArea) {
    parts.push(`*Area:* ${brief.details.approximateArea} ${brief.details.areaUnit}`);
  }
  parts.push(`*Scope:* ${brief.requirements.isGuidanceOnly ? 'Guidance requested' : brief.requirements.serviceLabels.join(', ')}`);
  parts.push(`*Stage:* ${brief.details.stageLabel}`);

  if (!brief.preferences.skipped && brief.preferences.budgetExpectation) {
    parts.push(`*Budget Expectation:* ${brief.preferences.budgetExpectation}`);
  }

  if (brief.requirements.additionalNotes) {
    parts.push(`*Notes:* ${brief.requirements.additionalNotes}`);
  }

  return parts.join('\n');
}

/**
 * Copies text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // Fallback for older browsers / iframe restrictions
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Triggers plain-text file download in the browser.
 */
export function downloadAsTextFile(filename: string, content: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
