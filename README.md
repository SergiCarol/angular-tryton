Angular Tryton
==============

![](example/images/ng-tryton-logo.png)

An [Angular 2](https://github.com/angular/angular) module that makes tryton
JSONRPC working in the *Angular Way*. Contains two services `trytonService` and
`sessionService` and one filter `urlTryton`.


Install
-------
```bash
npm install angular2-tryton
```
```
And checkout to branch ng2
Usage
-----

### Import services and inject them

```typescript
import {TrytonService} from 'angular2-tryton/services/tryton-service'
import {SessionService} from 'angular2-tryton/services/session-service'

@Component({
    ...
    providers: [HeroService]
})
...
```


How to contribute
-----------------

If you're still convinced that angular2-tryton needs to be modified in order to
handle your problem and you have an idea on how to do that, well here's how to
turn that idea into a commit (or two) in easy steps:

1. [Fork Angular Tryton](http://github.com/fulfilio/angular2-tryton) into your
   very own GitHub repository

2. Install git pre-commit hook `cp .hooks/pre-commit.sh .git/hooks/pre-commit`

3. Modify code as required.

4. Once you're satisfied with the changes and you want the rest of the Angular
   Tryton developers to take a look at them, push your changes back to your own
   repository and send us a Pull request to develop branch. Don't forget to add
   test with minimum 100% test coverage.


Authors and Contributors
------------------------

This module was built at [Openlabs](http://www.openlabs.co.in) for Angular 1,
and evolved and mantained by [Fulfil.io](http://www.fulfil.io).
It was migrated to Angular 2 and refactorized by
[Guillem Barba](http://www.guillem.alcarrer.net)


Professional Support
--------------------

This module is professionally supported by [Fulfil.io](http://www.fulfil.io).
If you are looking for on-site teaching or consulting support, contact our
[sales](mailto:sales@fulfil.io) and [support](mailto:support@fulfil.io) teams.
