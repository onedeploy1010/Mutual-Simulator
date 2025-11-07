import { type CalculationScenario, type InsertCalculationScenario } from "@shared/schema";

export interface IStorage {
  getScenarios(): Promise<CalculationScenario[]>;
  getScenario(id: string): Promise<CalculationScenario | undefined>;
  createScenario(scenario: InsertCalculationScenario): Promise<CalculationScenario>;
  deleteScenario(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private scenarios: Map<string, CalculationScenario>;

  constructor() {
    this.scenarios = new Map();
  }

  async getScenarios(): Promise<CalculationScenario[]> {
    return Array.from(this.scenarios.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getScenario(id: string): Promise<CalculationScenario | undefined> {
    return this.scenarios.get(id);
  }

  async createScenario(insertScenario: InsertCalculationScenario): Promise<CalculationScenario> {
    const id = crypto.randomUUID();
    const scenario: CalculationScenario = {
      ...insertScenario,
      id,
      createdAt: new Date(),
    };
    this.scenarios.set(id, scenario);
    return scenario;
  }

  async deleteScenario(id: string): Promise<boolean> {
    return this.scenarios.delete(id);
  }
}

export const storage = new MemStorage();
