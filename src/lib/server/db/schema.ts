import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
	id:         text('id').primaryKey(),
	name:       text('name').notNull(),
	email:      text('email').notNull().unique(),
	role:       text('role', { enum: ['sales_rep', 'manager', 'admin'] }).notNull().default('sales_rep'),
	avatarUrl:  text('avatar_url'),
	territory:  text('territory'),
	createdAt:  text('created_at').notNull().default(sql`(datetime('now'))`),
	updatedAt:  text('updated_at').notNull().default(sql`(datetime('now'))`)
});

// ─── Industries ───────────────────────────────────────────────────────────────
export const industries = sqliteTable('industries', {
	id:          text('id').primaryKey(),
	name:        text('name').notNull(),
	code:        text('code').notNull().unique(),
	description: text('description'),
	createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`)
});

// ─── Product Families ─────────────────────────────────────────────────────────
export const productFamilies = sqliteTable('product_families', {
	id:          text('id').primaryKey(),
	name:        text('name').notNull(),
	code:        text('code').notNull().unique(),
	description: text('description'),
	createdAt:   text('created_at').notNull().default(sql`(datetime('now'))`)
});

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = sqliteTable('products', {
	id:              text('id').primaryKey(),
	familyId:        text('family_id').notNull().references(() => productFamilies.id),
	name:            text('name').notNull(),
	sku:             text('sku').notNull().unique(),
	description:     text('description'),
	unitPrice:       real('unit_price').notNull(),
	uom:             text('uom').notNull().default('kg'),          // unit of measure
	primaryUseCase:  text('primary_use_case'),
	keyBenefits:     text('key_benefits'),                         // JSON array
	typicalVolumeKg: real('typical_volume_kg'),
	isActive:        integer('is_active', { mode: 'boolean' }).notNull().default(true),
	createdAt:       text('created_at').notNull().default(sql`(datetime('now'))`)
});

// ─── Product × Industry fit table ────────────────────────────────────────────
export const productIndustryFit = sqliteTable('product_industry_fit', {
	id:          text('id').primaryKey(),
	productId:   text('product_id').notNull().references(() => products.id),
	industryId:  text('industry_id').notNull().references(() => industries.id),
	fitScore:    real('fit_score').notNull(),   // 0-1
	useCase:     text('use_case'),
	notes:       text('notes')
}, (t) => ({
	productIndustryIdx: index('pif_product_industry_idx').on(t.productId, t.industryId)
}));

// ─── Accounts ─────────────────────────────────────────────────────────────────
export const accounts = sqliteTable('accounts', {
	id:              text('id').primaryKey(),
	name:            text('name').notNull(),
	industryId:      text('industry_id').notNull().references(() => industries.id),
	assignedUserId:  text('assigned_user_id').references(() => users.id),
	country:         text('country').notNull().default('Australia'),
	state:           text('state'),
	city:            text('city'),
	annualRevenue:   real('annual_revenue'),                       // USD
	employeeCount:   integer('employee_count'),
	website:         text('website'),
	status:          text('status', { enum: ['active', 'inactive', 'prospect'] }).notNull().default('active'),
	tier:            text('tier', { enum: ['strategic', 'key', 'standard'] }).notNull().default('standard'),
	tags:            text('tags'),                                  // JSON array
	createdAt:       text('created_at').notNull().default(sql`(datetime('now'))`),
	updatedAt:       text('updated_at').notNull().default(sql`(datetime('now'))`)
});

// ─── Account Product History ───────────────────────────────────────────────────
export const accountProductHistory = sqliteTable('account_product_history', {
	id:            text('id').primaryKey(),
	accountId:     text('account_id').notNull().references(() => accounts.id),
	productId:     text('product_id').notNull().references(() => products.id),
	volumeKg:      real('volume_kg').notNull(),
	totalValue:    real('total_value').notNull(),
	purchaseDate:  text('purchase_date').notNull(),
	isRecurring:   integer('is_recurring', { mode: 'boolean' }).notNull().default(false),
	notes:         text('notes'),
	createdAt:     text('created_at').notNull().default(sql`(datetime('now'))`)
}, (t) => ({
	accountIdx: index('aph_account_idx').on(t.accountId),
	productIdx: index('aph_product_idx').on(t.productId)
}));

// ─── Opportunity Stages ───────────────────────────────────────────────────────
export const opportunityStages = sqliteTable('opportunity_stages', {
	id:           text('id').primaryKey(),
	name:         text('name').notNull(),
	code:         text('code').notNull().unique(),
	order:        integer('order').notNull(),
	probability:  real('probability').notNull(),   // 0-1
	description:  text('description')
});

// ─── Opportunities ────────────────────────────────────────────────────────────
export const opportunities = sqliteTable('opportunities', {
	id:               text('id').primaryKey(),
	accountId:        text('account_id').notNull().references(() => accounts.id),
	assignedUserId:   text('assigned_user_id').references(() => users.id),
	stageId:          text('stage_id').notNull().references(() => opportunityStages.id),
	primaryProductId: text('primary_product_id').references(() => products.id),
	name:             text('name').notNull(),
	value:            real('value').notNull(),
	currency:         text('currency').notNull().default('AUD'),
	closeDate:        text('close_date').notNull(),
	problemStatement: text('problem_statement'),
	useCase:          text('use_case'),
	competitorNotes:  text('competitor_notes'),
	lostReason:       text('lost_reason'),
	isStalled:        integer('is_stalled', { mode: 'boolean' }).notNull().default(false),
	stalledDays:      integer('stalled_days').notNull().default(0),
	riskLevel:        text('risk_level', { enum: ['low', 'medium', 'high'] }).notNull().default('low'),
	createdAt:        text('created_at').notNull().default(sql`(datetime('now'))`),
	updatedAt:        text('updated_at').notNull().default(sql`(datetime('now'))`)
}, (t) => ({
	accountIdx: index('opp_account_idx').on(t.accountId),
	userIdx:    index('opp_user_idx').on(t.assignedUserId),
	stageIdx:   index('opp_stage_idx').on(t.stageId)
}));

// ─── Activities ───────────────────────────────────────────────────────────────
export const activities = sqliteTable('activities', {
	id:              text('id').primaryKey(),
	opportunityId:   text('opportunity_id').references(() => opportunities.id),
	accountId:       text('account_id').references(() => accounts.id),
	userId:          text('user_id').references(() => users.id),
	type:            text('type', { enum: ['call', 'email', 'meeting', 'demo', 'proposal', 'site_visit', 'sample_sent', 'quote'] }).notNull(),
	subject:         text('subject').notNull(),
	description:     text('description'),
	outcome:         text('outcome'),
	activityDate:    text('activity_date').notNull(),
	durationMinutes: integer('duration_minutes'),
	createdAt:       text('created_at').notNull().default(sql`(datetime('now'))`)
}, (t) => ({
	opportunityIdx: index('act_opportunity_idx').on(t.opportunityId),
	accountIdx:     index('act_account_idx').on(t.accountId)
}));

// ─── Notes ────────────────────────────────────────────────────────────────────
export const notes = sqliteTable('notes', {
	id:            text('id').primaryKey(),
	opportunityId: text('opportunity_id').references(() => opportunities.id),
	accountId:     text('account_id').references(() => accounts.id),
	userId:        text('user_id').references(() => users.id),
	content:       text('content').notNull(),
	isPinned:      integer('is_pinned', { mode: 'boolean' }).notNull().default(false),
	createdAt:     text('created_at').notNull().default(sql`(datetime('now'))`)
});

// ─── Recommendations ─────────────────────────────────────────────────────────
export const recommendations = sqliteTable('recommendations', {
	id:                   text('id').primaryKey(),
	opportunityId:        text('opportunity_id').references(() => opportunities.id),
	accountId:            text('account_id').references(() => accounts.id),
	primaryProductId:     text('primary_product_id').references(() => products.id),
	upsellProductId:      text('upsell_product_id').references(() => products.id),
	crossSellProductId:   text('cross_sell_product_id').references(() => products.id),
	confidenceScore:      real('confidence_score').notNull(),      // 0-1
	industryFitScore:     real('industry_fit_score').notNull(),
	similarAccountScore:  real('similar_account_score').notNull(),
	affinityScore:        real('affinity_score').notNull(),
	useCaseFitScore:      real('use_case_fit_score').notNull(),
	primaryReasoning:     text('primary_reasoning').notNull(),
	upsellReasoning:      text('upsell_reasoning'),
	crossSellReasoning:   text('cross_sell_reasoning'),
	nextBestAction:       text('next_best_action').notNull(),
	actionReasoning:      text('action_reasoning'),
	isAdopted:            integer('is_adopted', { mode: 'boolean' }).default(false),
	generatedAt:          text('generated_at').notNull().default(sql`(datetime('now'))`)
}, (t) => ({
	opportunityIdx: index('rec_opportunity_idx').on(t.opportunityId),
	accountIdx:     index('rec_account_idx').on(t.accountId)
}));

// ─── Type exports ─────────────────────────────────────────────────────────────
export type User                  = typeof users.$inferSelect;
export type Industry              = typeof industries.$inferSelect;
export type ProductFamily         = typeof productFamilies.$inferSelect;
export type Product               = typeof products.$inferSelect;
export type ProductIndustryFit    = typeof productIndustryFit.$inferSelect;
export type Account               = typeof accounts.$inferSelect;
export type AccountProductHistory = typeof accountProductHistory.$inferSelect;
export type OpportunityStage      = typeof opportunityStages.$inferSelect;
export type Opportunity           = typeof opportunities.$inferSelect;
export type Activity              = typeof activities.$inferSelect;
export type Note                  = typeof notes.$inferSelect;
export type Recommendation        = typeof recommendations.$inferSelect;

export type NewUser                  = typeof users.$inferInsert;
export type NewIndustry              = typeof industries.$inferInsert;
export type NewProductFamily         = typeof productFamilies.$inferInsert;
export type NewProduct               = typeof products.$inferInsert;
export type NewProductIndustryFit    = typeof productIndustryFit.$inferInsert;
export type NewAccount               = typeof accounts.$inferInsert;
export type NewAccountProductHistory = typeof accountProductHistory.$inferInsert;
export type NewOpportunityStage      = typeof opportunityStages.$inferInsert;
export type NewOpportunity           = typeof opportunities.$inferInsert;
export type NewActivity              = typeof activities.$inferInsert;
export type NewNote                  = typeof notes.$inferInsert;
export type NewRecommendation        = typeof recommendations.$inferInsert;
