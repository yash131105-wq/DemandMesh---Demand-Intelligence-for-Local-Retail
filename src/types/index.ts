export type DemandReason = 
  | 'OUT_OF_STOCK' 
  | 'NOT_CARRIED' 
  | 'VARIANT_UNAVAILABLE' 
  | 'PRICE_MISMATCH' 
  | 'OTHER';

export type RequestSource = 'VOICE_NOTE' | 'COUNTER_INQUIRY' | 'MANUAL_ENTRY' | 'SCANNER';

export type DemandStatus = 'CAPTURED' | 'REVIEWED' | 'RECOMMENDED' | 'RESTOCKED' | 'POOLED';

export type RecommendationType = 'RESTOCK' | 'TEST_ASSORTMENT' | 'WAIT' | 'POOL_PURCHASE';

export type UserRole = 'OWNER' | 'INVENTORY_MANAGER' | 'CASHIER';

export interface ProductCatalogItem {
  id: string;
  name: string;
  category: string;
  defaultVariant: string;
  variants: string[];
  currentStock: number;
  reorderPoint: number;
  costPrice: number;
  sellingPrice: number;
  moq: number;
  isCarried: boolean;
  leadTimeDays: number;
}

export interface DemandLedgerEntry {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  variant: string;
  quantity: number;
  reason: DemandReason;
  source: RequestSource;
  status: DemandStatus;
  confidenceScore: number;
  rawTranscript?: string;
  notes?: string;
  storeId: string;
  storeName: string;
  estimatedLostMargin: number;
  isOfflineQueued?: boolean;
}

export interface DailyDemandObservation {
  date: string;
  dayLabel: string;
  observedSales: number;
  availableStock: number;
  missedRequests: number;
  isStockout: boolean;
}

export interface ParticipatingStore {
  id: string;
  name: string;
  ownerName: string;
  neighborhood: string;
  lat: number;
  lng: number;
  coordinates: { x: number; y: number }; // Relative coordinate on canvas map (0-100%)
  distanceKm: number;
  proteinOatsCommitment: number;
  totalMissedRequestsLogged: number;
  joinedDaysAgo: number;
  isCurrentUserStore?: boolean;
}

export interface PredictiveStockAlert {
  productId: string;
  productName: string;
  variant: string;
  currentStock: number;
  dailyBurnRate: number;
  daysRemaining: number;
  predictedRunoutDate: string;
  urgency: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  reorderQuantity: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'STOCKOUT' | 'POOL_ALERT' | 'ASSORTMENT_OPPORTUNITY' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  actionRoute?: string;
}

export interface ActiveUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  storeName: string;
  storeLocation: string;
}
