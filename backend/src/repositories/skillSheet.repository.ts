import { BaseRepository } from './base.repository';
import knex from '../../database/connection';
import { Knex } from 'knex';

export interface SkillSheet {
  id: number;
  engineerId: number;
  companyId: number;
  summary?: string;
  totalExperienceYears?: number;
  programmingLanguages?: any;
  frameworks?: any;
  databases?: any;
  cloudServices?: any;
  tools?: any;
  certifications?: any;
  possibleRoles?: any;
  possiblePhases?: any;
  educationBackground?: any;
  careerSummary?: string;
  specialSkills?: string;
  completionPercentage: number;
  isCompleted: boolean;
  lastUpdatedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SkillSheetRepository extends BaseRepository<SkillSheet> {
  constructor() {
    super('skill_sheets');
  }
  
  async findByEngineerId(engineerId: number, trx?: Knex.Transaction) {
    const db = trx || knex;
    return db(this.tableName)
      .where({ engineerId })
      .whereNull('deletedAt')
      .first();
  }
  
  async create(data: Partial<SkillSheet>, trx?: Knex.Transaction) {
    const db = trx || knex;
    const [skillSheet] = await db(this.tableName)
      .insert({
        ...data,
        isCompleted: false,
        completionPercentage: data.completionPercentage || 0
      })
      .returning('*');
    return skillSheet;
  }
  
  async update(engineerId: number, data: Partial<SkillSheet>, trx?: Knex.Transaction) {
    const db = trx || knex;
    
    // 完了状態の判定
    const isCompleted = data.completionPercentage && data.completionPercentage >= 80;
    
    const [skillSheet] = await db(this.tableName)
      .where({ engineerId })
      .whereNull('deletedAt')
      .update({
        ...data,
        isCompleted
      })
      .returning('*');
    return skillSheet;
  }
  
  async deleteByEngineerId(engineerId: number, trx?: Knex.Transaction) {
    const db = trx || knex;
    return db(this.tableName)
      .where({ engineerId })
      .update({ 
        deletedAt: new Date(),
        updatedAt: new Date()
      });
  }
  
  async findByCompanyId(companyId: number, trx?: Knex.Transaction) {
    const db = trx || knex;
    return db(this.tableName)
      .where({ companyId })
      .whereNull('deletedAt')
      .orderBy('updatedAt', 'desc');
  }
  
  async countCompleted(companyId: number, trx?: Knex.Transaction) {
    const db = trx || knex;
    const result = await db(this.tableName)
      .where({ companyId, isCompleted: true })
      .whereNull('deletedAt')
      .count('* as count')
      .first();
    
    return parseInt(result?.count as string || '0');
  }
  
  async getAverageCompletion(companyId: number, trx?: Knex.Transaction) {
    const db = trx || knex;
    const result = await db(this.tableName)
      .where({ companyId })
      .whereNull('deletedAt')
      .avg('completionPercentage as average')
      .first();
    
    return Math.round(parseFloat(result?.average as string || '0'));
  }
}