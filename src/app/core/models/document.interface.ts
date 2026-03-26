export type DocumentStatus = 'uploading' | 'processing' | 'completed' | 'error';

export interface DocumentInsight {
  type: 'revenue' | 'risk' | 'opportunity' | 'recommendation' | string;
  icon: string;
  title: string;
  content: string;
}

export interface DocumentTag {
  label: string;
  icon: string;
  color?: string; // Optional: 'primary' | 'secondary' | 'tertiary' | 'slate'
}

export interface AppDocument {
  id?: string;
  name: string;
  size: number;
  type: string;
  url: string;
  status: DocumentStatus;
  userId: string;
  createdAt: number;
  summary?: string;
  insights?: DocumentInsight[];
  tags?: DocumentTag[];
  errorDetail?: string;
  pages?: number;
}


