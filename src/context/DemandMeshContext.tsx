import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  DemandLedgerEntry,
  ProductCatalogItem,
  ParticipatingStore,
  NotificationItem,
  ActiveUser,
  UserRole,
  DailyDemandObservation,
  PredictiveStockAlert,
} from '../types/index.ts';
import {
  INITIAL_USER,
  INITIAL_PRODUCTS,
  INITIAL_PARTICIPATING_STORES,
  INITIAL_LEDGER_ENTRIES,
  INITIAL_DAILY_OBSERVATIONS,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData.ts';
import {
  estimateUncensoredDemand,
  DemandEstimateResult,
  calculateNetworkPooling,
  PoolingAnalysis,
  DailyObservation,
} from '../utils/math.ts';

interface DemandMeshContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: ActiveUser;
  setUserRole: (role: UserRole) => void;
  entries: DemandLedgerEntry[];
  addDemandEntry: (entry: Omit<DemandLedgerEntry, 'id' | 'timestamp' | 'storeId' | 'storeName'>) => DemandLedgerEntry;
  updateDemandEntry: (id: string, updates: Partial<DemandLedgerEntry>) => void;
  deleteDemandEntry: (id: string) => void;
  products: ProductCatalogItem[];
  addProduct: (product: Omit<ProductCatalogItem, 'id'>) => ProductCatalogItem;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  selectedProduct: ProductCatalogItem;
  stores: ParticipatingStore[];
  updateStoreCommitment: (storeId: string, quantity: number) => void;
  observationWindow: 7 | 14 | 30;
  setObservationWindow: (days: 7 | 14 | 30) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  pendingOfflineCount: number;
  syncOfflineQueue: () => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  dailyObservations: DailyDemandObservation[];
  demandEstimate: DemandEstimateResult;
  poolingAnalysis: PoolingAnalysis;
  predictiveAlerts: PredictiveStockAlert[];
  pushAlertsEnabled: boolean;
  setPushAlertsEnabled: (enabled: boolean) => void;
  activeToast: { id: string; title: string; message: string; type: 'stockout' | 'success' | 'info' } | null;
  dismissToast: () => void;
  lastAddedId: string | null;
  resetToDemo: () => void;
  // Modal controllers
  isPooledModalOpen: boolean;
  setIsPooledModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
}

const DemandMeshContext = createContext<DemandMeshContextType | undefined>(undefined);

const STORAGE_KEY_ENTRIES = 'demandmesh_ledger_v2';
const STORAGE_KEY_PRODUCTS = 'demandmesh_products_v2';
const STORAGE_KEY_STORES = 'demandmesh_stores_v2';
const STORAGE_KEY_USER = 'demandmesh_user_v2';
const STORAGE_KEY_OFFLINE_QUEUE = 'demandmesh_offline_queue_v2';
const STORAGE_KEY_PUSH_ALERTS = 'demandmesh_push_alerts_v2';

export const DemandMeshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [observationWindow, setObservationWindow] = useState<7 | 14 | 30>(14);
  const [selectedProductId, setSelectedProductId] = useState<string>('prod_protein_oats');
  const [isOffline, setIsOfflineState] = useState<boolean>(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isPooledModalOpen, setIsPooledModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [activeToast, setActiveToast] = useState<{ id: string; title: string; message: string; type: 'stockout' | 'success' | 'info' } | null>(null);

  // Push notifications toggle state
  const [pushAlertsEnabled, setPushAlertsEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PUSH_ALERTS);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // User state
  const [user, setUser] = useState<ActiveUser>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  // Products with custom items support
  const [products, setProducts] = useState<ProductCatalogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Ledger entries
  const [entries, setEntries] = useState<DemandLedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENTRIES);
      return saved ? JSON.parse(saved) : INITIAL_LEDGER_ENTRIES;
    } catch {
      return INITIAL_LEDGER_ENTRIES;
    }
  });

  // Stores
  const [stores, setStores] = useState<ParticipatingStore[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STORES);
      return saved ? JSON.parse(saved) : INITIAL_PARTICIPATING_STORES;
    } catch {
      return INITIAL_PARTICIPATING_STORES;
    }
  });

  // Offline queue
  const [offlineQueue, setOfflineQueue] = useState<DemandLedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist products
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.warn('Failed to save products', e);
    }
  }, [products]);

  // Persist push alerts preference
  const setPushAlertsEnabled = useCallback((enabled: boolean) => {
    setPushAlertsEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_PUSH_ALERTS, JSON.stringify(enabled));
    } catch (e) {
      console.warn('Failed to save push alert pref', e);
    }

    if (enabled) {
      setActiveToast({
        id: `toast_${Date.now()}`,
        title: 'Push Alerts Enabled',
        message: 'You will receive predictive stockout alerts and neighbor buying notifications.',
        type: 'info',
      });
      setTimeout(() => setActiveToast(null), 4000);
    }
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  // Add custom product to catalog
  const addProduct = useCallback((newProdData: Omit<ProductCatalogItem, 'id'>): ProductCatalogItem => {
    const newId = `prod_custom_${Date.now()}`;
    const newProduct: ProductCatalogItem = {
      ...newProdData,
      id: newId,
    };
    setProducts(prev => [newProduct, ...prev]);
    setSelectedProductId(newId);
    return newProduct;
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.warn('Failed to save entries to localStorage', e);
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(stores));
    } catch (e) {
      console.warn('Failed to save stores to localStorage', e);
    }
  }, [stores]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed to save user to localStorage', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(offlineQueue));
    } catch (e) {
      console.warn('Failed to save offline queue to localStorage', e);
    }
  }, [offlineQueue]);

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  const setUserRole = useCallback((role: UserRole) => {
    setUser(prev => ({ ...prev, role }));
  }, []);

  const setIsOffline = useCallback((offline: boolean) => {
    setIsOfflineState(offline);
    if (!offline && offlineQueue.length > 0) {
      setNotifications(prev => [
        {
          id: `notif_online_${Date.now()}`,
          title: 'Connection Restored',
          message: `${offlineQueue.length} offline demand records are pending database synchronization.`,
          type: 'SYSTEM',
          timestamp: 'Just now',
          read: false,
        },
        ...prev,
      ]);
    }
  }, [offlineQueue]);

  // Add missed demand entry
  const addDemandEntry = useCallback((
    entryData: Omit<DemandLedgerEntry, 'id' | 'timestamp' | 'storeId' | 'storeName'>
  ): DemandLedgerEntry => {
    const newId = `dm_req_${Date.now()}`;
    const newEntry: DemandLedgerEntry = {
      ...entryData,
      id: newId,
      timestamp: new Date().toISOString(),
      storeId: user.id === 'usr_anand_01' ? 'store_01' : 'store_user',
      storeName: user.storeName,
      isOfflineQueued: isOffline,
    };

    if (isOffline) {
      setOfflineQueue(prev => [newEntry, ...prev]);
    }

    setEntries(prev => [newEntry, ...prev]);
    setLastAddedId(newId);

    // If matching active product, update store commitment
    if (newEntry.productId === selectedProductId || newEntry.productId === 'prod_protein_oats') {
      setStores(prevStores => 
        prevStores.map(s => 
          s.isCurrentUserStore 
            ? { 
                ...s, 
                proteinOatsCommitment: s.proteinOatsCommitment + newEntry.quantity,
                totalMissedRequestsLogged: s.totalMissedRequestsLogged + 1,
              } 
            : s
        )
      );
    }

    // Trigger push alert toast if push is enabled
    if (pushAlertsEnabled) {
      setActiveToast({
        id: `toast_${Date.now()}`,
        title: 'New Missed Demand Logged',
        message: `${newEntry.quantity}x ${newEntry.productName} (${newEntry.variant}) recorded. Ledger updated.`,
        type: 'success',
      });
      setTimeout(() => setActiveToast(null), 4000);
    }

    // Add alert notification
    setNotifications(prev => [
      {
        id: `notif_${Date.now()}`,
        title: 'New Missed Demand Logged',
        message: `${newEntry.quantity}x ${newEntry.productName} (${newEntry.variant}) recorded. Demand Ledger updated.`,
        type: 'STOCKOUT',
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);

    setTimeout(() => {
      setLastAddedId(null);
    }, 4000);

    return newEntry;
  }, [isOffline, user, selectedProductId, pushAlertsEnabled]);

  const updateDemandEntry = useCallback((id: string, updates: Partial<DemandLedgerEntry>) => {
    setEntries(prev => prev.map(entry => entry.id === id ? { ...entry, ...updates } : entry));
  }, []);

  const deleteDemandEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const updateStoreCommitment = useCallback((storeId: string, quantity: number) => {
    setStores(prev => prev.map(s => s.id === storeId ? { ...s, proteinOatsCommitment: Math.max(0, quantity) } : s));
  }, []);

  const syncOfflineQueue = useCallback(() => {
    if (offlineQueue.length === 0) return;
    setEntries(prev => 
      prev.map(entry => ({ ...entry, isOfflineQueued: false }))
    );
    const count = offlineQueue.length;
    setOfflineQueue([]);
    setNotifications(prev => [
      {
        id: `notif_sync_${Date.now()}`,
        title: 'Database Synchronized',
        message: `Successfully synchronized ${count} offline demand records with central server.`,
        type: 'SYSTEM',
        timestamp: 'Just now',
        read: false,
      },
      ...prev,
    ]);
  }, [offlineQueue]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const resetToDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_ENTRIES);
    localStorage.removeItem(STORAGE_KEY_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY_STORES);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_OFFLINE_QUEUE);
    setEntries(INITIAL_LEDGER_ENTRIES);
    setProducts(INITIAL_PRODUCTS);
    setStores(INITIAL_PARTICIPATING_STORES);
    setUser(INITIAL_USER);
    setOfflineQueue([]);
    setIsOfflineState(false);
    setObservationWindow(14);
    setSelectedProductId('prod_protein_oats');
    setNotifications(INITIAL_NOTIFICATIONS);
    setActiveTab('overview');
  }, []);

  // Dynamically compute daily observations reflecting live captured entries
  const dailyObservations = useMemo(() => {
    const base = observationWindow === 7 
      ? INITIAL_DAILY_OBSERVATIONS.slice(-7)
      : INITIAL_DAILY_OBSERVATIONS;

    // Sum today's live entered requests
    const todayIso = new Date().toISOString().slice(0, 10);
    const todayLiveEntries = entries.filter(e => 
      e.timestamp.startsWith(todayIso) && e.productId === selectedProductId
    );
    const todayLiveMissed = todayLiveEntries.reduce((acc, e) => acc + e.quantity, 0);

    return base.map(day => {
      if (day.date === todayIso || day.dayLabel === 'Today') {
        const totalMissedToday = day.missedRequests + todayLiveMissed;
        return {
          ...day,
          missedRequests: totalMissedToday,
          isStockout: true,
        };
      }
      return day;
    });
  }, [observationWindow, entries, selectedProductId]);

  // Recalculate demand estimation dynamically whenever observations or entries change
  const demandEstimate = useMemo(() => {
    const obsForMath: DailyObservation[] = dailyObservations.map(d => ({
      date: d.date,
      observedSales: d.observedSales,
      availableStock: d.availableStock,
      missedRequests: d.missedRequests,
      isStockout: d.isStockout,
    }));
    return estimateUncensoredDemand(obsForMath, 0.8);
  }, [dailyObservations]);

  // Predictive Low-Stock Alerts across carried products
  const predictiveAlerts = useMemo((): PredictiveStockAlert[] => {
    return products.map(prod => {
      // Calculate daily burn rate
      let burnRate = 2.0;
      if (prod.id === selectedProductId) {
        burnRate = Math.max(1.0, demandEstimate.meanDailyDemand);
      } else {
        // Derive from logged missed requests or default
        const prodEntries = entries.filter(e => e.productId === prod.id);
        const count = prodEntries.reduce((acc, e) => acc + e.quantity, 0);
        burnRate = Math.max(1.0, Number((count / 14 + 1.2).toFixed(1)));
      }

      const daysRemaining = prod.currentStock > 0 
        ? Math.max(0, Math.floor(prod.currentStock / burnRate))
        : 0;

      let urgency: 'CRITICAL' | 'WARNING' | 'HEALTHY' = 'HEALTHY';
      if (prod.currentStock === 0 || daysRemaining <= 1) {
        urgency = 'CRITICAL';
      } else if (daysRemaining <= 4) {
        urgency = 'WARNING';
      }

      const runoutDateObj = new Date();
      runoutDateObj.setDate(runoutDateObj.getDate() + daysRemaining);
      const predictedRunoutDate = prod.currentStock === 0 
        ? 'Stocked Out Now'
        : daysRemaining === 1 
          ? 'Tomorrow'
          : runoutDateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

      return {
        productId: prod.id,
        productName: prod.name,
        variant: prod.defaultVariant,
        currentStock: prod.currentStock,
        dailyBurnRate: Number(burnRate.toFixed(1)),
        daysRemaining,
        predictedRunoutDate,
        urgency,
        reorderQuantity: Math.max(prod.reorderPoint * 2, prod.moq || 12),
      };
    });
  }, [products, selectedProductId, demandEstimate, entries]);

  // Recalculate pooling analysis across participating stores
  const poolingAnalysis = useMemo(() => {
    const storeContribs = stores.map(s => ({
      storeId: s.id,
      storeName: s.name,
      quantity: s.proteinOatsCommitment,
      location: s.neighborhood,
    }));
    return calculateNetworkPooling(storeContribs, selectedProduct.moq, selectedProduct.costPrice, 15);
  }, [stores, selectedProduct]);

  const value = {
    activeTab,
    setActiveTab,
    user,
    setUserRole,
    entries,
    addDemandEntry,
    updateDemandEntry,
    deleteDemandEntry,
    products,
    addProduct,
    selectedProductId,
    setSelectedProductId,
    selectedProduct,
    stores,
    updateStoreCommitment,
    observationWindow,
    setObservationWindow,
    isOffline,
    setIsOffline,
    pendingOfflineCount: offlineQueue.length,
    syncOfflineQueue,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    dailyObservations,
    demandEstimate,
    poolingAnalysis,
    predictiveAlerts,
    pushAlertsEnabled,
    setPushAlertsEnabled,
    activeToast,
    dismissToast,
    lastAddedId,
    resetToDemo,
    isPooledModalOpen,
    setIsPooledModalOpen,
    isExportModalOpen,
    setIsExportModalOpen,
  };

  return (
    <DemandMeshContext.Provider value={value}>
      {children}
    </DemandMeshContext.Provider>
  );
};

export const useDemandMesh = (): DemandMeshContextType => {
  const context = useContext(DemandMeshContext);
  if (!context) {
    throw new Error('useDemandMesh must be used within a DemandMeshProvider');
  }
  return context;
};
