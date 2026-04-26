import type { NdmlKycStatusResult, PanVerificationResult } from "@/types/verification";

// Sample PANs that drive deterministic mock responses for demos.
export const SAMPLE_VALID_PAN = "ABCDE1234F";
export const SAMPLE_INVALID_PAN = "ZZZZZ0000Z";
export const SAMPLE_REJECTED_PAN = "REJEC1234T";
export const SAMPLE_NOT_FOUND_PAN = "NOTFD1234X";

export function buildPanResult(pan: string, fullName: string): PanVerificationResult {
  const isInvalid = pan === SAMPLE_INVALID_PAN;
  const holderName = isInvalid ? "" : "AARAV MEHTA";
  const nameMatch =
    !isInvalid && fullName.trim().toUpperCase().split(/\s+/)[0] === holderName.split(/\s+/)[0];
  return {
    id: `pan_${Date.now().toString(36)}`,
    pan,
    status: isInvalid ? "invalid" : "valid",
    nameMatch,
    panHolderName: holderName || "—",
    category: "individual",
    lastChecked: new Date().toISOString(),
  };
}

export function buildNdmlResult(pan: string): NdmlKycStatusResult {
  if (pan === SAMPLE_NOT_FOUND_PAN) {
    return {
      id: `kyc_${Date.now().toString(36)}`,
      pan,
      kycStatus: "not_found",
      provider: "NDML",
      remarks: "No KYC record found for this PAN. Investor must complete fresh KYC.",
    };
  }
  if (pan === SAMPLE_REJECTED_PAN) {
    return {
      id: `kyc_${Date.now().toString(36)}`,
      pan,
      kycStatus: "rejected",
      provider: "NDML",
      holderName: "RAVI KUMAR",
      lastUpdated: "2026-02-14T11:08:00Z",
      kraSource: "NDML KRA",
      remarks: "Address proof rejected. Please re-upload a valid document.",
    };
  }
  if (pan === SAMPLE_INVALID_PAN) {
    return {
      id: `kyc_${Date.now().toString(36)}`,
      pan,
      kycStatus: "in_review",
      provider: "CAMS",
      holderName: "—",
      lastUpdated: "2026-04-20T08:32:00Z",
      kraSource: "CAMS KRA",
      remarks: "KYC modification under review by CAMS.",
    };
  }
  return {
    id: `kyc_${Date.now().toString(36)}`,
    pan,
    kycStatus: "verified",
    provider: "NDML",
    holderName: "AARAV MEHTA",
    lastUpdated: "2026-03-12T10:24:00Z",
    kraSource: "NDML KRA",
  };
}
