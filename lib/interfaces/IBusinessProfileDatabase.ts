export interface IBusinessProfileDatabase {
    getBusinessProfile(userId: string): Promise<Record<string, unknown> | null>;
    upsertBusinessProfile(userId: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    updateBusinessProfile(userId: string, updates: Record<string, unknown>): Promise<void>;
    deleteBusinessProfile(userId: string): Promise<void>;
}
