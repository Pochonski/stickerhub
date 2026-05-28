import type { PackBundle } from "@/core/domain/value-objects";

export interface PackState {
  quantity: number;
  totalOpened: number;
  coins: number;
}

export interface PackRepository {
  getPackState(userId: string): Promise<PackState>;
  decrementPack(userId: string): Promise<number>;
  decrementPacks(userId: string, count: number): Promise<number>;
  spendCoins(userId: string, amount: number): Promise<boolean>;
  addCoins(userId: string, amount: number): Promise<void>;
  buyPacks(userId: string, bundle: PackBundle): Promise<boolean>;
  grantPacks(userId: string, count: number): Promise<void>;
}
