import { 
  Component,
  Input, 
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
 } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnInit, OnChanges {

  @Input() totalPages: number;
  @Input() currentPage: number;
  @Input() resultCountSubject: Subject<[number, number, number]>;

  @Output() pageChanged: EventEmitter<number>;

  private pagesArray: number[];
  private startCount: number;
  private endCount: number;
  private totalCount: number;
  constructor(
  ) {
    this.pagesArray = [];
    this.pageChanged = new EventEmitter();
    this.startCount = 0;
    this.endCount = 0;
    this.totalCount = 0;
  }

  ngOnInit() {
    this.makePagesArray();
    this.resultCountSubject.subscribe( (data) => {
      this.startCount = data[0];
      this.endCount = data[1];
      this.totalCount = data[2];
    });
  }

  makePagesArray() {
    this.pagesArray = [];
    if ( this.totalPages < 4 ) {
      for ( let i = 0; i < this.totalPages; i++) {
        this.pagesArray.push(i);
      }
    } else {
      for ( let i = this.currentPage; i < this.currentPage + 4; i++) {
        this.pagesArray.push(i);
      }
    }
  }

  handlePageChange(e: any, pageNumber: number): boolean {
    e.preventDefault();
    this.pageChanged.emit(pageNumber);
    this.makePagesArray();
    return false;
  }

  handlePreviousPage(e: any): boolean {
    e.preventDefault();
    if ( this.currentPage > 0) {
      this.pageChanged.emit(this.currentPage - 1);
      this.makePagesArray();
    }
    return false;
  }

  handleNextPage(e: any): boolean {
    e.preventDefault();
    if ( this.currentPage < (this.totalPages - 1)) {
      this.pageChanged.emit(this.currentPage + 1);
      this.makePagesArray();
    }
    return false;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ( changes.totalPages ) {
      this.makePagesArray();
    }
    if ( changes.currentPage ) {
      this.makePagesArray();
    }
  }
}
