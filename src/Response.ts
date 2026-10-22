class RequesterResponse {
    response: Response;
    status: number;
    data: any;
    private dataPromise?: Promise<any>;

    constructor(response: Response) {
        this.response = response;
        this.status = response.status;
    }

    getResponseData(): Promise<any> {
        if (this.data !== undefined) {
            return Promise.resolve(this.data);
        }

        if (this.response.body === null || this.response.status === 204 || this.response.status === 205 || this.response.status === 304) {
            this.data = '';
            return Promise.resolve('');
        }

        if (!this.dataPromise) {
            this.dataPromise = (this.response.headers.get('content-type')?.includes('application/json')
                ? this.response.json()
                : this.response.headers.has('content-disposition') ? this.response.blob() : this.response.text()
            ).then((data) => {
                this.data = data;
                return data;
            });
        }

        return this.dataPromise;
    }

    getData(): any {
        return this.data;
    }

    setData(data: any) {
        this.data = data;
    }

    getHeaders(): Headers {
        return this.response.headers;
    }

}

export default RequesterResponse;
