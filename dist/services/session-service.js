"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
const core_1 = require('@angular/core');
const Observable_1 = require('rxjs/Observable');
require('rxjs/Rx');
const angular_safeguard_1 = require('angular-safeguard');
const tryton_service_1 = require('./tryton-service');
let SessionService = class SessionService {
    constructor(trytonService, locker) {
        this.trytonService = trytonService;
        this.locker = locker;
        this.loadAllFromStorage();
    }
    loadAllFromStorage() {
        this.database = this.locker.get('database');
        this.login = this.locker.get('login');
        this.userId = this.locker.get('userId');
        this.sessionId = this.locker.get('sessionId');
        this.context = this.locker.get('context');
    }
    setSession(database, login, userId, sessionId) {
        this.locker.set('database', database || null);
        this.locker.set('login', login || null);
        this.locker.set('userId', userId || null);
        this.locker.set('sessionId', sessionId || null);
        this.loadAllFromStorage();
    }
    clearSession() {
        this.userId = null;
        this.sessionId = null;
        this.context = null;
        this.locker.remove('userId');
        this.locker.remove('sessionId');
        this.locker.remove('context');
    }
    setDatabase(database) {
        this.locker.set('database', database || null);
        this.database = this.locker.get('database');
    }
    setDefaultContext(context) {
        this.locker.set('context', context);
        this.loadAllFromStorage();
    }
    rpc(method, params, context = null) {
        const new_context = Object.assign({}, this.context || {}, context || {});
        const new_params = [
            this.userId,
            this.sessionId,
            ...params || [],
            new_context
        ];
        return this.trytonService.rpc(this.database, method, new_params);
    }
    doLogin(database, username, password, getPreferences = false) {
        let urlRegex = /^https?:\/\//i;
        let loginObservable;
        if (urlRegex.test(this.trytonService.serverUrl)
            || this.trytonService.serverUrl === '/') {
            loginObservable = this._tryLogin(database, username, password);
        }
        else {
            this.trytonService.setServerUrl('https://' + this.trytonService.serverUrl);
            loginObservable = this._tryLogin(database, username, password)
                .retryWhen(errors => {
                return errors.do(function (e) {
                    let serverUrl = this.trytonService.serverUrl;
                    if (serverUrl.startsWith('https')) {
                        this.trytonService.setServerUrl(serverUrl.replace(/^https/i, 'http'));
                    }
                    else {
                        throw e;
                    }
                });
            });
        }
        return loginObservable.do(result => {
            if (getPreferences) {
                this.rpc('model.res.user.get_preferences', [true], null)
                    .subscribe(preferences => {
                    this.setDefaultContext(preferences);
                });
            }
        });
    }
    _tryLogin(database, username, password) {
        return this.trytonService.rpc(database, 'common.login', [username, password])
            .map(response => {
            if (response && response instanceof Array && response.length == 2) {
                return {
                    'userId': String(response[0]),
                    'sessionId': String(response[1]),
                };
            }
            else {
                console.log('Returned data by common.login:', response);
                return Observable_1.Observable.throw('Unexpected returned data for common.login method');
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
};
SessionService = __decorate([
    core_1.Injectable(), 
    __metadata('design:paramtypes', [tryton_service_1.TrytonService, angular_safeguard_1.Locker])
], SessionService);
exports.SessionService = SessionService;
//# sourceMappingURL=session-service.js.map