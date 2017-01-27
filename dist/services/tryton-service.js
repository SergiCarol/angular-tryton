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
const http_1 = require('@angular/http');
const Observable_1 = require('rxjs/Observable');
require('rxjs/Rx');
const angular_safeguard_1 = require('angular-safeguard');
let TrytonService = class TrytonService {
    constructor(http, locker) {
        this.http = http;
        this.locker = locker;
        this.serverUrl = locker.get('serverUrl');
        if (!this.serverUrl) {
            this.setServerUrl('http://localhost:8000/');
        }
    }
    setServerUrl(url) {
        this.serverUrl = url + (url.slice(-1) === '/' ? '' : '/');
        this.locker.set('serverUrl', this.serverUrl);
    }
    rpc(database, method, params) {
        let _params = params;
        return this.http.post(this.serverUrl + (database || ''), JSON.stringify({
            'method': method,
            'params': _params || [],
        }))
            .map(res => {
            let new_res = res.json();
            console.log("new_res:", new_res);
            if (!new_res) {
                return Observable_1.Observable.throw('Empty response');
            }
            else if (new_res['result']) {
                return new_res['result'];
            }
            else if (new_res['error']) {
                return this._handleTrytonError(new_res['error']);
            }
            return new_res;
        })
            .catch(this._handleError);
    }
    _handleError(error) {
        console.error(error);
        return Observable_1.Observable.throw(error || 'Server error');
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
                case "ConcurrencyException":
                    tryton_error = {
                        'error': 'tryton:ConcurrencyException',
                        'messages': error[1],
                    };
                default:
                    tryton_error = {
                        'error': 'tryton:ConcurrencyException',
                        'messages': error,
                    };
            }
        }
        else {
            tryton_error = {
                'error': 'tryton:ConcurrencyException',
                'messages': error,
            };
        }
        throw new Error(tryton_error);
    }
    getServerVersion() {
        return this.rpc(null, 'common.version', [null, null]);
    }
};
TrytonService = __decorate([
    core_1.Injectable(), 
    __metadata('design:paramtypes', [http_1.Http, angular_safeguard_1.Locker])
], TrytonService);
exports.TrytonService = TrytonService;
;
//# sourceMappingURL=tryton-service.js.map