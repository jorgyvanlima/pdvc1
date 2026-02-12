import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = '1d';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface TokenPayload {
    id: number;
    email: string;
    role: string;
}

export const generateTokens = (payload: TokenPayload) => {
    // Cast options to any to avoid overload resolution issues with jsonwebtoken types
    const options: any = {
        expiresIn: JWT_EXPIRES_IN,
    };

    const refreshOptions: any = {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    };

    const accessToken = (jwt as any).sign(payload, JWT_SECRET, options);
    const refreshToken = (jwt as any).sign(payload, JWT_SECRET, refreshOptions);

    return { accessToken, refreshToken };
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
