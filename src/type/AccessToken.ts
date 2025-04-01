type AccessToken = {
    access_token: string;
    refresh_token: string | null;
    token_type: string;
    expires_in: number | null;
    scope: string[] | null
}

export default AccessToken;
