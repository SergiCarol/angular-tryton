import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import { Locker } from 'angular-safeguard';
import { TrytonService } from './tryton-service';
export declare class SessionService {
    private trytonService;
    private locker;
    database: string;
    login: string;
    userId: number;
    sessionId: number;
    context: {};
    constructor(trytonService: TrytonService, locker: Locker);
    loadAllFromStorage(): void;
    setSession(database: string, login: string, userId: number, sessionId: number): void;
    clearSession(): void;
    setDatabase(database: string): void;
    setDefaultContext(context: {}): void;
    rpc(method: string, params: Array<any>, context?: {}): Observable<any>;
    doLogin(database: string, username: string, password: string, getPreferences?: boolean): Observable<{
        userId: string;
        sessionId: string;
    }>;
    private _tryLogin(database, username, password);
    doLogout(): Observable<any>;
    isLoggedIn(): boolean;
}
