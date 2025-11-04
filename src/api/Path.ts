export interface Path {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    params?: {
        [key: string]: any;
    };
    prefix?: string;
}
