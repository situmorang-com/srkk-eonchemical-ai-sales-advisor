import { writable } from 'svelte/store';
import * as staticData from '../data';

// Create stores from static data
export const industries = writable(staticData.industries);
export const users = writable(staticData.users);
export const productFamilies = writable(staticData.productFamilies);
export const opportunityStages = writable(staticData.opportunityStages);
export const accounts = writable(staticData.accounts);
export const opportunities = writable(staticData.opportunities);
export const products = writable(staticData.products);
export const productIndustryFit = writable(staticData.productIndustryFit);
export const notes = writable(staticData.notes);
export const activities = writable(staticData.activities);
export const accountProductHistory = writable(staticData.accountProductHistory);

// Helper functions to query data
export function getAccountById(id: string) {
  let result: any = null;
  accounts.subscribe(value => {
    result = value.find(a => a.id === id);
  })();
  return result;
}

export function getOpportunityById(id: string) {
  let result: any = null;
  opportunities.subscribe(value => {
    result = value.find(o => o.id === id);
  })();
  return result;
}

export function getAccountsByIndustry(industryId: string) {
  let result: any[] = [];
  accounts.subscribe(value => {
    result = value.filter(a => a.industryId === industryId);
  })();
  return result;
}

export function getOpportunitiesByAccount(accountId: string) {
  let result: any[] = [];
  opportunities.subscribe(value => {
    result = value.filter(o => o.accountId === accountId);
  })();
  return result;
}

export function getOpportunitiesByStage(stageId: string) {
  let result: any[] = [];
  opportunities.subscribe(value => {
    result = value.filter(o => o.stageId === stageId);
  })();
  return result;
}

export function getActivitiesByAccount(accountId: string) {
  let result: any[] = [];
  activities.subscribe(value => {
    result = value.filter(a => a.accountId === accountId);
  })();
  return result;
}

export function getNotesByAccount(accountId: string) {
  let result: any[] = [];
  notes.subscribe(value => {
    result = value.filter(n => n.accountId === accountId);
  })();
  return result;
}

export function getHistoryByAccount(accountId: string) {
  let result: any[] = [];
  accountProductHistory.subscribe(value => {
    result = value.filter(h => h.accountId === accountId);
  })();
  return result;
}
