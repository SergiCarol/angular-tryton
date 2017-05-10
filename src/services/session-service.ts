import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {Locker} from 'angular-safeguard';

import {TrytonService} from './tryton-service';

@Injectable()
export class SessionService {
    database: string;
    login: string;
    userId: number;
    sessionId: number;
    context: {};

    constructor(private trytonService: TrytonService, private locker: Locker) {
        // When use it you can choose where to save data (local, session...)
        // see https://github.com/MikaAK/angular2-locker
        this.loadAllFromStorage();
    }

    loadAllFromStorage() {
        this.database = this.locker.get('database');
        this.login = this.locker.get('login');
        this.userId = this.locker.get('userId');
        this.sessionId = this.locker.get('sessionId');
        this.context = this.locker.get('context');
    }

    setSession(database: string, login: string, userId: number, sessionId: number) {
        // TODO: save it in shareable way to be used
        this.locker.set('database', database || null);
        this.locker.set('login', login || null);
        this.locker.set('userId', Number(userId) || null);
        this.locker.set('sessionId', sessionId || null);
        this.loadAllFromStorage();
    }
    get_auth() {
        this.loadAllFromStorage();
        return btoa(this.login + ':' + this.userId + ':' + this.sessionId);
    }

    clearSession() {
        this.userId = null;
        this.sessionId = null;
        this.context = null;
        this.locker.remove('userId');
        this.locker.remove('sessionId');
        this.locker.remove('context');
    }

    setDatabase(database: string) {
        this.locker.set('database', database || null);
        this.database = this.locker.get('database');
    }

    setDefaultContext(context: {}) {
        this.locker.set('context', context);
        this.loadAllFromStorage();
    }

    rpc(method: string, params: Array<any>, context: {} = null): Observable<any> {
        // original scope rpc()
        // copy object in a new imuptable object
        const new_context = Object.assign({}, this.context || {}, context || {})
        // Concat list in a new immutable list
        const new_params = [
            ...params || [],
            new_context
        ];
        return this.trytonService.rpc(this.database, method, new_params);
    }

    doLogin(database: string, username: string, password: string, getPreferences: boolean = false): Observable<{ userId: string, sessionId: string }> {
        let urlRegex = /^https?:\/\//i;
        let loginObservable;
        // Make sure URL has http or https in it.
        if (urlRegex.test(this.trytonService.serverUrl)
                || this.trytonService.serverUrl === '/') {
            loginObservable = this._tryLogin(database, username, password);
        } else {
            // If URL doesn't have protocol, try https first then http.
            this.trytonService.setServerUrl('https://' + this.trytonService.serverUrl);
            loginObservable = this._tryLogin(database, username, password)
            .retryWhen(errors => {
                     return errors.do(function(e) {
                        let serverUrl = this.trytonService.serverUrl;
                        if (serverUrl.startsWith('https')) {
                            this.trytonService.setServerUrl(serverUrl.replace(/^https/i, 'http'));
                        } else {
                            throw e;
                        }
                    });
                });
        }

        return loginObservable.do(result => {
            // Get the user preferences if user has asked for it.
            if (getPreferences) {
                this.rpc('model.res.user.get_preferences', [true], null)
                    .subscribe(preferences => {
                        this.setDefaultContext(preferences);
                    });
            }
        });
    }

    private _tryLogin(database: string, username: string, password: string) {
        // call login on tryton server and if the login is succesful set the
        // userId and session
        return this.trytonService.rpc(
                database, 'common.db.login', [username, password])
            .map(response => {
                if (response && response instanceof Array && response.length == 2) {
                    return {
                        'userId': String(response[0]),
                        'sessionId': String(response[1]),
                    }
                } else {
                    console.log('Returned data by common.db.login:', response);
                    return Observable.throw(
                        'Unexpected returned data for common.login method');
                }
            })
            .do(result => {
                this.setSession(database, username, result['userId'], result['sessionId']);
            });
    }

    doLogout() {
        let observable = this.rpc('common.db.logout', null, null);
        this.clearSession();
        return observable;
    }

    isLoggedIn() {
        return !!this.sessionId;
    }
}
