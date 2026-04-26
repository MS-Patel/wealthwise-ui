export type PanStatus = "valid" | "invalid";
export type NdmlKycStatus = "verified" | "in_review" | "rejected" | "not_found";

export interface PanVerificationResult {
  id: string;
  pan: string;
  status: PanStatus;
  nameMatch: boolean;
  panHolderName: string;
  category: "individual" | "company" | "huf" | "trust" | "other";
  lastChecked: string;
}

export interface NdmlKycStatusResult {
  id: string;
  pan: string;
  kycStatus: NdmlKycStatus;
  provider: "NDML" | "CAMS" | "CVL" | "KARVY";
  holderName?: string;
  lastUpdated?: string;
  kraSource?: string;
  remarks?: string;
}
