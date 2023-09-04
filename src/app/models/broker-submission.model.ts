export interface IBrokerSubmission {
  userId: string;
  userPin: string;
  recordType: string;
  companyId: string;
  companyName: string;
  companyIncno: string;
  submittedBy: string;
  recordCount: number;
  periodEnded: string;
  uploadFile: File;
  totalCredit: number;
  totalDebit: number;
}
