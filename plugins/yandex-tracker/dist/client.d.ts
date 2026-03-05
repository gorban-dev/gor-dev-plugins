interface ClientConfig {
    token?: string;
    iamToken?: string;
    orgId?: string;
    cloudOrgId?: string;
}
export declare class TrackerClient {
    private readonly authHeader;
    private readonly orgIdHeaderName;
    private readonly orgIdHeaderValue;
    constructor(config: ClientConfig);
    request<T>(endpoint: string, options?: RequestInit): Promise<T>;
    requestRaw(endpoint: string, options?: RequestInit, contentType?: string): Promise<Response>;
}
export {};
//# sourceMappingURL=client.d.ts.map