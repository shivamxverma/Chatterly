export interface GetChatGroupResponse {
    id: string;
    userId: string;
    title: string;
    passcode: string | null;
    createdAt: string;
}

export interface ChatbotResponse {
    success: boolean;
    message?: string;
}

export interface CreateChatGroup {
    title: string,
    passcode: string | null
}