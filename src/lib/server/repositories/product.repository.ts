import { db } from '../db';
import { products, productFamilies, productIndustryFit, industries } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import type { ProductSummary, ProductDetail } from '$lib/types';

export async function getAllProducts(): Promise<ProductSummary[]> {
	const rows = await db
		.select({
			id:             products.id,
			name:           products.name,
			sku:            products.sku,
			familyId:       products.familyId,
			familyName:     productFamilies.name,
			unitPrice:      products.unitPrice,
			uom:            products.uom,
			primaryUseCase: products.primaryUseCase,
			isActive:       products.isActive
		})
		.from(products)
		.leftJoin(productFamilies, eq(products.familyId, productFamilies.id))
		.where(eq(products.isActive, true))
		.orderBy(products.name);

	return rows.map((r) => ({
		id:             r.id,
		name:           r.name,
		sku:            r.sku,
		familyName:     r.familyName ?? 'Unknown',
		unitPrice:      r.unitPrice,
		uom:            r.uom,
		primaryUseCase: r.primaryUseCase
	}));
}

export async function getProductById(id: string): Promise<ProductDetail | null> {
	const [row] = await db
		.select({
			id:              products.id,
			name:            products.name,
			sku:             products.sku,
			familyId:        products.familyId,
			familyName:      productFamilies.name,
			unitPrice:       products.unitPrice,
			uom:             products.uom,
			primaryUseCase:  products.primaryUseCase,
			description:     products.description,
			keyBenefits:     products.keyBenefits,
			typicalVolumeKg: products.typicalVolumeKg,
			isActive:        products.isActive
		})
		.from(products)
		.leftJoin(productFamilies, eq(products.familyId, productFamilies.id))
		.where(eq(products.id, id));

	if (!row) return null;

	return {
		id:              row.id,
		name:            row.name,
		sku:             row.sku,
		familyId:        row.familyId,
		familyName:      row.familyName ?? 'Unknown',
		unitPrice:       row.unitPrice,
		uom:             row.uom,
		primaryUseCase:  row.primaryUseCase,
		description:     row.description,
		keyBenefits:     JSON.parse(row.keyBenefits ?? '[]'),
		typicalVolumeKg: row.typicalVolumeKg,
		isActive:        row.isActive
	};
}

export async function getProductsByIndustry(industryId: string): Promise<ProductSummary[]> {
	const rows = await db
		.select({
			id:             products.id,
			name:           products.name,
			sku:            products.sku,
			familyName:     productFamilies.name,
			unitPrice:      products.unitPrice,
			uom:            products.uom,
			primaryUseCase: products.primaryUseCase,
			fitScore:       productIndustryFit.fitScore
		})
		.from(productIndustryFit)
		.innerJoin(products, eq(productIndustryFit.productId, products.id))
		.leftJoin(productFamilies, eq(products.familyId, productFamilies.id))
		.where(and(eq(productIndustryFit.industryId, industryId), eq(products.isActive, true)))
		.orderBy(productIndustryFit.fitScore);

	return rows.map((r) => ({
		id:             r.id,
		name:           r.name,
		sku:            r.sku,
		familyName:     r.familyName ?? 'Unknown',
		unitPrice:      r.unitPrice,
		uom:            r.uom,
		primaryUseCase: r.primaryUseCase
	}));
}

export async function getRawProductsWithFit() {
	return db
		.select({
			productId:   products.id,
			productName: products.name,
			sku:         products.sku,
			familyId:    products.familyId,
			familyName:  productFamilies.name,
			unitPrice:   products.unitPrice,
			uom:         products.uom,
			primaryUseCase: products.primaryUseCase,
			industryId:  productIndustryFit.industryId,
			fitScore:    productIndustryFit.fitScore,
			useCase:     productIndustryFit.useCase
		})
		.from(productIndustryFit)
		.innerJoin(products, eq(productIndustryFit.productId, products.id))
		.leftJoin(productFamilies, eq(products.familyId, productFamilies.id))
		.where(eq(products.isActive, true));
}
