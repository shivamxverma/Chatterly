export interface EmailPasswordRegisterRequest {
    email: string;
    password: string;
    displayName?: string;
}

export interface GoogleAuthResponse {
    isNewUser: boolean;
    userId: string;
    accessToken?: string;
    refreshToken?: string;
}
  
export interface RefreshTokenResponse {
accessToken: string;
refreshToken: string;
}


export interface EmailPasswordLoginRequest {
    email: string;
    password: string;
}

export interface EmailPasswordAuthResponse {
    isNewUser: boolean;
    userId: string;
    accessToken: string;
    refreshToken: string;
}



export interface RegisterResponse {
    success: boolean;
    message: string;
}