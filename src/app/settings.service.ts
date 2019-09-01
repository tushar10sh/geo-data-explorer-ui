import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  public isPartialIntersect: boolean = true;
  public imageResizePercentageValue: number = 10;
  public clearCacheSubject: Subject<boolean> = new Subject();
  public cacheClearedSubject: Subject<boolean> = new Subject();

  constructor() { }
}
