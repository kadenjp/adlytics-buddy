export interface IUserInformationDatabase {
    getUserInformation(userId: string): Promise<Record<string, unknown> | null>;
    upsertUserInformation(userId: string, data: Record<string, unknown>): Promise<Record<string, unknown>>;
    updateUserInformation(userId: string, updates: Record<string, unknown>): Promise<Record<string, unknown>>;
    deleteUserInformation(userId: string): Promise<void>;
}
