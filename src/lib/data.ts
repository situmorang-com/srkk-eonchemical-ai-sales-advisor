// Static embedded data for client-side rendering
// Extracted from seed.ts for static site deployment

export const industries = [
  { id: 'ind-maritime', name: 'Maritime', code: 'MARITIME', description: 'Shipping, ports, shipyards, offshore oil & gas, ferry operations across Indonesian archipelago' },
  { id: 'ind-mining', name: 'Mining', code: 'MINING', description: 'Coal mining, mineral mining, open-pit operations, nickel smelting, copper/gold processing' },
  { id: 'ind-general', name: 'General Industrial', code: 'GENERAL', description: 'Steel manufacturing, palm oil processing, food & beverage, cement, petrochemical, automotive' },
];

export const users = [
  { id: 'u-01', name: 'James Thornton', email: 'james@eonchemicals.co.id', region: 'QLD / Marine', role: 'account_executive', active: true },
  { id: 'u-02', name: 'Maria Santos', email: 'maria@eonchemicals.co.id', region: 'Jakarta / Maritime', role: 'account_executive', active: true },
  { id: 'u-03', name: 'Ahmad Pratama', email: 'ahmad@eonchemicals.co.id', region: 'Sumatera / Mining', role: 'account_executive', active: true },
  { id: 'u-04', name: 'Budi Santoso', email: 'budi@eonchemicals.co.id', region: 'Kalimantan / Mining', role: 'account_executive', active: true },
  { id: 'u-05', name: 'Dr. Siti Nurhaliza', email: 'siti@eonchemicals.co.id', region: 'Eastern / Technical', role: 'technical_specialist', active: true },
];

export const productFamilies = [
  { id: 'pf-coating', name: 'Protective Coatings', code: 'COATING', description: 'Marine epoxy, anti-fouling, zinc primers for corrosion protection' },
  { id: 'pf-fuel', name: 'Fuel Treatment', code: 'FUEL', description: 'Marine fuel treatment, coal dust suppression, combustion prevention' },
  { id: 'pf-clean', name: 'Cleaning Chemicals', code: 'CLEAN', description: 'Tank cleaning, degreaser, surface passivation' },
  { id: 'pf-boiler', name: 'Boiler & Cooling', code: 'BOILER', description: 'Boiler scale treatment, cooling tower biocide, oxygen scavenger' },
  { id: 'pf-spill', name: 'Oil Spill Response', code: 'SPILL', description: 'Dispersant, absorbent, response kits' },
  { id: 'pf-lube', name: 'Lubrication', code: 'LUBE', description: 'Open gear lube, hydraulic oil, wire rope lubricant' },
  { id: 'pf-fire', name: 'Fire Safety', code: 'FIRE', description: 'AFFF foam, dry chemical, marine approved' },
];

export const opportunityStages = [
  { id: 'stg-1', name: 'Prospect', code: 'PROSPECT', sequence: 1 },
  { id: 'stg-2', name: 'Qualification', code: 'QUAL', sequence: 2 },
  { id: 'stg-3', name: 'Proposal', code: 'PROPOSAL', sequence: 3 },
  { id: 'stg-4', name: 'Negotiation', code: 'NEGOTIATION', sequence: 4 },
  { id: 'stg-5', name: 'Closed Won', code: 'WON', sequence: 5 },
];

// Sample accounts and opportunities - full data would be 25 accounts, 60 opps, etc.
// For brevity, including key accounts and sample data structure

export const accounts = [
  { id: 'acc-01', name: 'PT Pelindo', industryId: 'ind-maritime', assignedUserId: 'u-02', country: 'Indonesia', state: 'DKI Jakarta', city: 'Jakarta', annualRevenue: 450000000000, employeeCount: 12500, tier: 'strategic' as const, status: 'active' as const, website: 'pelindo.co.id', tags: JSON.stringify(['port-operator', 'jakarta', 'container-terminal', 'BUMN']) },
  { id: 'acc-02', name: 'PT Pertamina Trans Kontinental', industryId: 'ind-maritime', assignedUserId: 'u-02', country: 'Indonesia', state: 'DKI Jakarta', city: 'Jakarta', annualRevenue: 280000000000, employeeCount: 2800, tier: 'strategic' as const, status: 'active' as const, website: 'pertaminatrans.co.id', tags: JSON.stringify(['tanker-operator', 'shipping', 'marine-fuel', 'listed']) },
  { id: 'acc-06', name: 'PT PAL Indonesia', industryId: 'ind-maritime', assignedUserId: 'u-03', country: 'Indonesia', state: 'Jawa Timur', city: 'Surabaya', annualRevenue: 125000000000, employeeCount: 5600, tier: 'strategic' as const, status: 'active' as const, website: 'pal.co.id', tags: JSON.stringify(['shipyard', 'BUMN', 'naval-repair', 'new-build']) },
  { id: 'acc-11', name: 'PT Adaro Energy', industryId: 'ind-mining', assignedUserId: 'u-04', country: 'Indonesia', state: 'Kalimantan Selatan', city: 'Balangan', annualRevenue: 65000000000000, employeeCount: 5500, tier: 'strategic' as const, status: 'active' as const, website: 'adaro.com', tags: JSON.stringify(['coal', 'kalimantan', 'major-miner', 'listed']) },
  { id: 'acc-19', name: 'PT Krakatau Steel', industryId: 'ind-general', assignedUserId: 'u-02', country: 'Indonesia', state: 'Banten', city: 'Cilegon', annualRevenue: 22000000000000, employeeCount: 6200, tier: 'strategic' as const, status: 'active' as const, website: 'kfrg.co.id', tags: JSON.stringify(['steel', 'BUMN', 'heavy-industry']) },
];

export const opportunities = [
  { id: 'opp-01', accountId: 'acc-01', assignedUserId: 'u-02', stageId: 'stg-3', primaryProductId: 'p-co01', name: 'Tanjung Priok Wharf Recoating Project', value: 2800000000, currency: 'IDR' as const, closeDate: '2026-05-30', problemStatement: 'Severe tropical corrosion on Berth 1-3 steel structures at Tanjung Priok. Salt spray and high humidity accelerating coating failure. Need IMO-grade epoxy system.', useCase: 'wharf steel structure anti-rust coating marine tropical', isStalled: false, stalledDays: 0, riskLevel: 'low' as const },
  { id: 'opp-08', accountId: 'acc-06', assignedUserId: 'u-03', stageId: 'stg-3', primaryProductId: 'p-co05', name: 'PAL Indonesia Anti-Fouling Paint Contract', value: 5000000000, currency: 'IDR' as const, closeDate: '2026-07-31', problemStatement: 'Annual anti-fouling paint supply for new builds and repair division. Current supplier Chugoku Paints increasing prices 20%.', useCase: 'anti-fouling paint shipbuilder supply contract self-polishing', competitorNotes: 'Incumbent: Chugoku Marine Paints. Price increase giving us opening.', isStalled: false, stalledDays: 0, riskLevel: 'medium' as const },
  { id: 'opp-26', accountId: 'acc-11', assignedUserId: 'u-04', stageId: 'stg-4', primaryProductId: 'p-fu02', name: 'Adaro Stockpile Dust Suppression Expansion', value: 2800000000, currency: 'IDR' as const, closeDate: '2026-05-15', problemStatement: 'Expanding coal production to 60MT/year. Additional stockpile areas need CoalGuard 810 for spontaneous combustion prevention in tropical heat.', useCase: 'coal stockpile dust suppression spontaneous combustion Kalimantan', isStalled: false, stalledDays: 0, riskLevel: 'low' as const },
  { id: 'opp-45', accountId: 'acc-19', assignedUserId: 'u-02', stageId: 'stg-4', primaryProductId: 'p-b01', name: 'Krakatau Steel Boiler Chemical Program', value: 2500000000, currency: 'IDR' as const, closeDate: '2026-04-30', problemStatement: 'Steel mill boilers critical for process steam. Current Nalco program expensive and underperforming on silica scale. Looking to switch.', competitorNotes: 'Incumbent: Nalco/Ecolab. Contract expires end of April.', useCase: 'boiler chemical steel mill process steam silica scale', isStalled: false, stalledDays: 0, riskLevel: 'low' as const },
];

export const products: any[] = [
  { id: 'p-co01', familyId: 'pf-coating', name: 'EonCoat 551', sku: 'EC-551-20L', description: 'Epoxy protective coating for steel structures', pricePerKg: 285000, currency: 'IDR' },
];

export const productIndustryFit: any[] = [
  { id: 'pif-01', productId: 'p-co01', industryId: 'ind-maritime', fitScore: 95, commonUseCase: 'wharf protection, hull coating' },
];

export const notes: any[] = [
  { id: 'n-01', opportunityId: 'opp-01', accountId: 'acc-01', userId: 'u-02', content: 'Pak Hendra (Asset Manager) is the key decision maker for Pelindo coating projects. He has authority up to Rp 5B. Above that needs Direksi approval. Very technical — appreciates detailed scope documents.', isPinned: true },
  { id: 'n-02', opportunityId: 'opp-08', accountId: 'acc-06', userId: 'u-03', content: 'PAL Indonesia currently uses Chugoku Marine Paints for anti-fouling. Chugoku announcing 20% price increase effective July. This is our window. Key contact: Pak Bambang (Head of Coating Division).', isPinned: true },
];

export const activities: any[] = [
  { id: 'act-01', opportunityId: 'opp-01', accountId: 'acc-01', userId: 'u-02', type: 'site_visit' as const, subject: 'Tanjung Priok wharf condition survey', description: 'Walked Berth 1-3 with Pelindo asset manager Pak Hendra. Documented coating failure areas with photos. Severe tropical delamination on north-facing structures.', outcome: 'Pelindo requesting formal quotation with detailed scope of work', activityDate: '2026-03-15', durationMinutes: 240 },
];

export const accountProductHistory: any[] = [
  { id: 'h-01', accountId: 'acc-01', productId: 'p-co01', volumeKg: 800, totalValue: 228000000, purchaseDate: '2025-03-10', isRecurring: true, notes: 'Annual port structure coating supply' },
];
