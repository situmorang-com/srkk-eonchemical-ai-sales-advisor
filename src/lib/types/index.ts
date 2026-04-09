// ─────────────────────────────────────────────────────────────────────────────
// Shared TypeScript types for AI Sales Advisor
// Safe to import from both server and client code
// ─────────────────────────────────────────────────────────────────────────────

export type UserRole = 'sales_rep' | 'manager' | 'admin';
export type AccountStatus = 'active' | 'inactive' | 'prospect';
export type AccountTier = 'strategic' | 'key' | 'standard';
export type RiskLevel = 'low' | 'medium' | 'high';
export type ActivityType = 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'site_visit' | 'sample_sent' | 'quote';

// ─── Enriched / View Models ───────────────────────────────────────────────────

export interface UserSummary {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	territory: string | null;
}

export interface IndustrySummary {
	id: string;
	name: string;
	code: string;
}

export interface ProductFamilySummary {
	id: string;
	name: string;
	code: string;
}

export interface ProductSummary {
	id: string;
	name: string;
	sku: string;
	familyName: string;
	unitPrice: number;
	uom: string;
	primaryUseCase: string | null;
}

export interface ProductDetail extends ProductSummary {
	familyId: string;
	description: string | null;
	keyBenefits: string[];
	typicalVolumeKg: number | null;
	isActive: boolean;
}

export interface AccountSummary {
	id: string;
	name: string;
	industryId: string;
	industryName: string;
	status: AccountStatus;
	tier: AccountTier;
	city: string | null;
	state: string | null;
	country: string;
	assignedUserName: string | null;
	openOpportunities: number;
	totalPurchaseValue: number;
}

export interface AccountDetail extends AccountSummary {
	assignedUserId: string | null;
	website: string | null;
	annualRevenue: number | null;
	employeeCount: number | null;
	tags: string[];
	purchaseHistory: PurchaseHistoryItem[];
	recentActivities: ActivityItem[];
	openOpportunityList: OpportunitySummary[];
	notes: NoteItem[];
	similarAccounts: AccountSummary[];
}

export interface PurchaseHistoryItem {
	id: string;
	productId: string;
	productName: string;
	productSku: string;
	familyName: string;
	volumeKg: number;
	totalValue: number;
	purchaseDate: string;
	isRecurring: boolean;
}

export interface OpportunitySummary {
	id: string;
	name: string;
	accountId: string;
	accountName: string;
	industryName: string;
	stageName: string;
	stageCode: string;
	stageProbability: number;
	stageOrder: number;
	value: number;
	currency: string;
	closeDate: string;
	isStalled: boolean;
	stalledDays: number;
	riskLevel: RiskLevel;
	assignedUserName: string | null;
	daysSinceActivity: number | null;
	primaryProductName: string | null;
}

export interface OpportunityDetail extends OpportunitySummary {
	assignedUserId: string | null;
	primaryProductId: string | null;
	problemStatement: string | null;
	useCase: string | null;
	competitorNotes: string | null;
	ageInStageDays: number;
	activities: ActivityItem[];
	notes: NoteItem[];
	recommendation: RecommendationResult | null;
}

export interface ActivityItem {
	id: string;
	type: ActivityType;
	subject: string;
	description: string | null;
	outcome: string | null;
	activityDate: string;
	durationMinutes: number | null;
	userName: string | null;
}

export interface NoteItem {
	id: string;
	content: string;
	isPinned: boolean;
	createdAt: string;
	userName: string | null;
}

export interface RecommendationResult {
	id: string;
	primaryProduct: ProductSummary;
	upsellProduct: ProductSummary | null;
	crossSellProduct: ProductSummary | null;
	confidenceScore: number;
	scoreBreakdown: {
		industryFit: number;
		similarAccounts: number;
		affinity: number;
		useCaseFit: number;
	};
	primaryReasoning: string;
	upsellReasoning: string | null;
	crossSellReasoning: string | null;
	nextBestAction: string;
	actionReasoning: string | null;
	isAdopted: boolean | null;
	generatedAt: string;
}

// ─── Dashboard Types ───────────────────────────────────────────────────────────

export interface DashboardData {
	priorityOpportunities: OpportunitySummary[];
	stalledDeals: OpportunitySummary[];
	recommendedActions: RecommendedAction[];
	stats: DashboardStats;
	pipelineByStage: PipelineStageBreakdown[];
}

export interface DashboardStats {
	totalPipelineValue: number;
	openOpportunities: number;
	stalledDeals: number;
	avgDealAge: number;
	closingThisMonth: number;
	closingThisMonthValue: number;
	winRateEstimate: number;
}

export interface RecommendedAction {
	opportunityId: string;
	opportunityName: string;
	accountName: string;
	action: string;
	urgency: 'high' | 'medium' | 'low';
	reason: string;
}

// ─── Manager Dashboard ────────────────────────────────────────────────────────

export interface ManagerDashboardData {
	teamMembers: TeamMemberSummary[];
	stalledInterventions: StalledIntervention[];
	pipelineByStage: PipelineStageBreakdown[];
	adoptionSummary: AdoptionSummary;
	topAccounts: AccountSummary[];
}

export interface TeamMemberSummary {
	userId: string;
	name: string;
	openOpportunities: number;
	pipelineValue: number;
	stalledDeals: number;
	activitiesThisWeek: number;
}

export interface StalledIntervention {
	opportunityId: string;
	opportunityName: string;
	accountName: string;
	assignedTo: string;
	stalledDays: number;
	lastActivity: string | null;
	suggestedAction: string;
	riskLevel: RiskLevel;
}

export interface PipelineStageBreakdown {
	stageName: string;
	stageCode: string;
	count: number;
	totalValue: number;
	avgAge: number;
}

export interface AdoptionSummary {
	totalRecommendations: number;
	adopted: number;
	adoptionRate: number;
}

// ─── Copilot / Chat ───────────────────────────────────────────────────────────

export interface CopilotMessage {
	id: string;
	role: 'user' | 'assistant';
	content: string;
	timestamp: string;
	contextType?: 'opportunity' | 'account' | 'general';
	contextId?: string;
	sources?: CopilotSource[];
}

export interface CopilotSource {
	type: 'product' | 'account' | 'opportunity' | 'recommendation';
	id: string;
	label: string;
}

export interface CopilotRequest {
	message: string;
	contextType?: 'opportunity' | 'account' | 'general';
	contextId?: string;
	conversationHistory: CopilotMessage[];
}

export interface CopilotResponse {
	content: string;
	sources: CopilotSource[];
}
