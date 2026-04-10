export interface EmailPasswordRegisterRequest {
    email: string;
    password: string;
    displayName?: string;
}



export interface RegisterResponse {
    success: boolean;
    message: string;
}