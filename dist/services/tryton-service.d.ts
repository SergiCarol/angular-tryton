import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { Locker } from 'angular-safeguard';
export declare class TrytonService {
    private http;
    private locker;
    serverUrl: string;
    constructor(http: Http, locker: Locker);
    setServerUrl(url: any): void;
    rpc(database: string, method: string, params: Array<any>): Observable<any>;
    private _handleError(error);
    _handleTrytonError(error: any): void;
    getServerVersion(): Observable<{}>;
}
