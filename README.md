# DemandMesh — Demand Intelligence for Local Retail

> **The missing demand-intelligence layer for local retail.**  
> Traditional POS only records what *sold*. DemandMesh captures what customers *tried to buy* but couldn't due to stockouts, missing assortments, or pack-size mismatches. Convert lost customer inquiries into an uncensored Demand Ledger, forecast true demand, and unlock pooled bulk discounts across neighborhood kirana stores.

---

## 🌟 Key Capabilities

### 1. 🎙️ Quick Counter & Voice Capture
- **Type or Speak Any Product**: Cashiers and storekeepers can record inquiries in under 5 seconds by typing or speaking natural sentences (e.g. *"3 customers asked for 500 g Protein Oats, but we are out"* or *"Customer wanted Surf Excel 1kg"*).
- **Auto-Registration**: Dynamically registers any new product into the store catalog without requiring manual pre-configuration.
- **Instant Actions**: Includes 1-tap quick buttons for frequent kirana stockouts, an inline quantity stepper, and a dedicated **Clear** button.

### 2. 📖 Lost Sales Book (Digital Khata)
- A persistent digital register of every missed sale with structured fields: Product, Variant, Inquiry Count, Reason (*Out of Stock*, *Not Carried*, *Wrong Pack Size*, *Price Mismatch*), and Estimated Lost Margin (₹).
- Exportable to clean CSV for Excel or supplier reorders, plus printable executive procurement summaries.

### 3. ⚠️ Predictive Low-Stock Alerts
- Estimates the exact calendar date a product will run out of inventory based on combined sales velocity and uncensored customer inquiries.
- Includes an interactive **Push Alerts: ON/OFF** notification toggle.

### 4. 🗺️ Local Demand Network (Group Buying Map)
- **Interactive Leaflet Mapping**: Real OpenStreetMap tiles showing 7 local neighborhood kiranas in Indiranagar, Bengaluru.
- **Cluster Radius & Flight Paths**: Visualizes a 2.5 km cooperative network radius with custom pins displaying pledged units.
- **Wholesale MOQ Pooling**: Aggregates small retail orders to hit distributor wholesale Minimum Order Quantities (MOQ = 25 units), unlocking 15% bulk discounts without tying up working capital solo.

### 5. 📈 Stock Planner & Budget Optimization
- **Censored Sales Math**: Operates on $S = \min(D, A)$, where $D$ is underlying true demand, $S$ is observed sales, and $A$ is shelf availability.
- **Newsvendor Optimization**: Calculates the optimal order quantity balancing underage margin loss ($C_u = P - C$) against overage holding penalty ($C_o = C \cdot h$).
- **Recharts Spend Trajectory**: Visualizes current solo procurement costs vs. DemandMesh pooled procurement with cumulative capital savings.

---

## 📐 Mathematical Formulation

### 1. Censored Demand Estimation
$$\hat{D} = S + M \cdot \kappa$$
Where:
- $S$ = Observed completed POS sales
- $M$ = Logged unfulfilled customer inquiries
- $\kappa$ = Counter inquiry capture multiplier ($\kappa \approx 1.0$ at counter, calibrated for walkaway walkouts)

### 2. Critical Fractile (Newsvendor)
$$CF^* = \frac{C_u}{C_u + C_o} = \frac{P - C}{(P - C) + (C \cdot h)}$$
Where:
- $P$ = Selling price (MRP)
- $C$ = Unit wholesale cost price
- $h$ = Holding/spoilage rate per cycle

### 3. Lead-Time Reorder Point
$$ROP = \mu_L + z \cdot \sigma_L$$
Where $\mu_L = \hat{D}_{daily} \times L$ and $\sigma_L = \sigma_{daily} \times \sqrt{L}$.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Motion
- **Visualizations**: Leaflet 1.9 (OpenStreetMap), Recharts 3.10
- **Audio / NLP**: Web Speech API with fallback deterministic parser
- **Testing**: Node Native Test Runner (`node --test`), Playwright Chromium E2E
- **State & Storage**: React Context + LocalStorage persistence + Offline synchronization queue

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm 9+

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yash131105-wq/DemandMesh---Demand-Intelligence-for-Local-Retail.git
   cd DemandMesh---Demand-Intelligence-for-Local-Retail
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment** (Optional for Gemini features):
   ```bash
   cp .env.example .env
   ```

4. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open **http://localhost:3000** in your browser.

5. **Run test suite**:
   ```bash
   npx tsx --test src/utils/math.test.ts
   ```

6. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📄 License
Apache-2.0