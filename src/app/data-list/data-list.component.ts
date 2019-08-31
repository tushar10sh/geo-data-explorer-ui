import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SocketService } from '../socket.service';

@Component({
  selector: 'app-data-list',
  templateUrl: './data-list.component.html',
  styleUrls: ['./data-list.component.css']
})
export class DataListComponent implements OnInit {

  @Input() startIndex: number;
  @Input() tifDataListArray: any;
  @Input() noSearchResultsFound: boolean;

  @Output() rowClicked: EventEmitter<string>;
  @Output() rowEnter:   EventEmitter<string>;
  @Output() rowLeft:    EventEmitter<string>;

  constructor(
  ) {
    this.rowClicked = new EventEmitter();
    this.rowEnter   = new EventEmitter();
    this.rowLeft    = new EventEmitter();
  }

  ngOnInit() {
  }

  handleRowClick(e: any, elemId: string) {
    this.rowClicked.emit(elemId);
  }

  handleRowEnter(e: any, elemId: string) {
    this.rowEnter.emit(elemId);
  }

  handleRowLeft(e: any, elemId: string) {
    this.rowLeft.emit(elemId);
  }
}
