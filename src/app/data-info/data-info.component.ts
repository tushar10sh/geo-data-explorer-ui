import { 
  Component, 
  OnInit, 
  OnChanges, 
  Input, 
  Output, 
  EventEmitter, 
  SimpleChanges, 
  ViewChild, 
  ElementRef} from '@angular/core';

declare let $: any;

@Component({
  selector: 'app-data-info',
  templateUrl: './data-info.component.html',
  styleUrls: ['./data-info.component.css']
})
export class DataInfoComponent implements OnInit {

  @ViewChild('dataInfoModal', {static: false}) modal: ElementRef;

  @Input() hidden: boolean;
  @Input() title: string;
  @Input() dataInfo: any;

  @Output() dismissDataInfo : EventEmitter<boolean>;
  @Output() showDataOnMap   : EventEmitter<string> ;

  constructor() {
    this.dismissDataInfo = new EventEmitter;
    this.showDataOnMap   = new EventEmitter;
    this.dataInfo = {};
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if ( (changes.hidden || changes.title || changes.dataInfo) && this.modal) {
      if ( changes.hidden ) {
        $(this.modal.nativeElement).modal({show: !changes.hidden.currentValue});
      } else {
        $(this.modal.nativeElement).modal({show: !this.hidden});
      }
    }
  }

  isObjectEmpty(obj: any): boolean {
    return (Object.keys(obj).length === 0 && obj.constructor === Object);
  }

  getObjectAsString(obj: any): string {
    return JSON.stringify(obj);
  }

  handleShowDataOnMap(e: any): boolean {
    e.preventDefault();
    this.dismissDataInfo.emit(true);
    this.showDataOnMap.emit(this.dataInfo.id);
    return false;
  }

  handleClose(e: any): boolean {
    e.preventDefault();
    this.dismissDataInfo.emit(true);
    return false;
  }

}
