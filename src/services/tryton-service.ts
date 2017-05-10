import {Injectable, Inject} from '@angular/core';
import {Http, Headers} from '@angular/http';
import { DOCUMENT } from '@angular/platform-browser'
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {Locker} from 'angular-safeguard'

@Injectable()
export class TrytonService {
    serverUrl: string;
    database: string;
    login: string;
    userId: number;
    sessionId: number;

    constructor(private http: Http, private locker: Locker,
        @Inject(DOCUMENT) private document: any) {
        // When use it you can choose where to save data (local, session...)
        // see https://github.com/MikaAK/angular2-locker
        this.serverUrl = locker.get('serverUrl');
        if (!this.serverUrl) {
          this.setServerUrl(this.document.location.href);
        }
    }

    loadAllFromStorage() {
        this.database = this.locker.get('database');
        this.login = this.locker.get('login');
        this.userId = this.locker.get('userId');
        this.sessionId = this.locker.get('sessionId');
    }
    get_auth() {
        this.loadAllFromStorage();
        return btoa(this.login + ':' + this.userId + ':' + this.sessionId);
    }
    setServerUrl(url) {
        this.serverUrl = url + (url.slice(-1) === '/' ? '' : '/');
        let array = this.serverUrl.split('/')
        array.splice(3, 1)
        this.serverUrl = array.join('/')
        this.locker.set('serverUrl', this.serverUrl);
    }

    rpc(database: string, method: string, params: Array<any>): Observable<any> {
        // Original tryton service rpc()
        // var _params = Fulfil.transformRequest(params);
        let _params = params;
        let headers = new Headers()
        headers.append('Content-Type', 'application/json')
        headers.append('Authorization','Session ' + this.get_auth());
        return this.http.post(
            this.serverUrl + (database || '') + '/',
            JSON.stringify({
                'method': method,
                'params': _params || [],
            }),{
                headers: headers
            })
            .map(res => {
                let new_res = res.json();
                console.log("new_res:", new_res);
                if (!new_res) {
                    return Observable.throw('Empty response');
                } else if (new_res['result']) {
                    return new_res['result'];  // TODO: Fulfil.transformResponse
                } else if (new_res['error']) {
                    return this._handleTrytonError(new_res['error']);
                }
                return new_res;
            })
            .catch(this._handleError);
    }

    private _handleError(error) {
        console.error(error);
        return Observable.throw(error || 'Server error');
    }

    _handleTrytonError(error) {
        console.log("TrytonError:", error);
        let tryton_error;
        if (error instanceof Array) {
            switch (error[0]) {
                case "NotLogged":
                    tryton_error = {
                        'error': 'tryton:NotLogged',
                        'messages': []
                    };
                    break;
                case "UserError":
                    tryton_error = {
                        'error': 'tryton:UserError',
                        'messages': error[1]
                    };
                    break;
                case "UserWarning":
                    tryton_error = {
                        'error': 'tryton:UserWarning',
                        'messages': error[1]
                    };
                    break;
                case "ConcurrencyException":
                    tryton_error = {
                        'error': 'tryton:ConcurrencyException',
                        'messages': error[1],
                    };
                    break;
                default:
                    tryton_error = {
                        'error': 'tryton:ConcurrencyException',
                        'messages': error,
                    };
            }
        } else {
            tryton_error = {
                'error': 'tryton:ConcurrencyException',
                'messages': error,
            };
        }
        // TODO: raise an error that could be showed to user
        throw tryton_error;
    }

    getServerVersion(): Observable<{}> {
        return this.rpc(null, 'common.db.version', [null, null]);
    }
};
