class RequesterResponse {
    response: Response;
    status: number;
    data: any;

    constructor(response: Response) {
        this.response = response;
        this.status = response.status;
    }

    getResponseData(): Promise<any> {
        return new Promise((resolve, reject) => {
            if(this.data) {
                return resolve(this.data);
            }

            (this.response.headers.get('content-type')?.includes('application/json') ? this.response.json() : this.response.text()).then((data) => {
                this.data = data;
                resolve(this.data);
            })
        });
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
