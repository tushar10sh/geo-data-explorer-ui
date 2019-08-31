import { Component,
  Input, 
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
 } from '@angular/core';

import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

@Component({
  selector: 'app-data-table-filter',
  templateUrl: './data-table-filter.component.html',
  styleUrls: ['./data-table-filter.component.css']
})
export class DataTableFilterComponent implements OnInit, OnDestroy {

  @Input() readonly placeholder: string = 'Search ...';
  @Input() value: string;
  @Output() searchStringChanged: EventEmitter<string>;

  private searchSubject: Subject<string>;

  constructor() { 
    this.searchStringChanged = new EventEmitter();
    this.searchSubject = new Subject();
    this.setSearchSubscription();
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.searchSubject.unsubscribe();
  }

  setSearchSubscription() {
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe( (searchValue: string) => {
      this.searchStringChanged.emit(searchValue);
    });
  }

  handleSearch(e: any, searchString: string): boolean {
    e.preventDefault();
    this.searchStringChanged.emit(searchString);
    return false;
  }

  handleClick(e: any, searchString: string): boolean {
    e.preventDefault();
    if ( searchString === "Search ...") {
      this.value = "";
    }
    return false;
  }
}
