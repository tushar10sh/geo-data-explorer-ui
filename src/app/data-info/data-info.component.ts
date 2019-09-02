import { SettingsService } from './../settings.service';
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
  @ViewChild('configureModal', {static: false}) configureModal: ElementRef;

  @Input() hidden: boolean;
  @Input() title: string;
  @Input() dataInfo: any;

  @Output() dismissDataInfo : EventEmitter<boolean>;
  @Output() showDataOnMap   : EventEmitter<[string, number, number, number, number]> ;

  private imageResizePercentageValue: number;
  private dataMinValue: number;
  private dataMaxValue: number;
  private noDataValue: number;

  constructor(
    public settingsService: SettingsService
  ) {
    this.dismissDataInfo = new EventEmitter;
    this.showDataOnMap   = new EventEmitter;
    this.dataInfo = {};
  }

  ngOnInit() {
    this.imageResizePercentageValue = this.settingsService.imageResizePercentageValue;
    this.dataMinValue = this.settingsService.dataMinValue;
    this.dataMaxValue = this.settingsService.dataMaxValue;
    this.noDataValue = this.settingsService.noDataValue;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ( (changes.hidden || changes.title || changes.dataInfo) && this.modal) {
      if ( changes.hidden ) {
        $(this.modal.nativeElement).modal({show: !changes.hidden.currentValue});
      } else {
        $(this.modal.nativeElement).modal({show: !this.hidden});
      }
      this.imageResizePercentageValue = this.settingsService.imageResizePercentageValue;
      this.dataMinValue = this.settingsService.dataMinValue;
      this.dataMaxValue = this.settingsService.dataMaxValue;
      this.noDataValue = this.settingsService.noDataValue;
    }
  }

  isObjectEmpty(obj: any): boolean {
    return (Object.keys(obj).length === 0 && obj.constructor === Object);
  }

  getObjectAsString(obj: any): string {
    return JSON.stringify(obj);
  }

  handleShowConfigureOption(e: any): boolean {
    e.preventDefault();
    $(this.configureModal.nativeElement).modal({show: true});
    return false;
  }

  handleShowDataOnMap(e: any): boolean {
    e.preventDefault();
    this.dismissDataInfo.emit(true);
    this.showDataOnMap.emit([
      this.dataInfo.id,
      this.imageResizePercentageValue,
      this.dataMinValue,
      this.dataMaxValue,
      this.noDataValue
    ]);
    return false;
  }

  handleClose(e: any): boolean {
    e.preventDefault();
    this.dismissDataInfo.emit(true);
    return false;
  }

  handleResizePercentangeChange(e: any, value: number): boolean {
    e.preventDefault();
    this.imageResizePercentageValue = value;
    return false;
  }

  handleDataMinValueChange(e: any, value: number) {
    e.preventDefault();
    this.dataMinValue = value;
    return false;
  }

  handleDataMaxValueChange(e: any, value: number) {
    e.preventDefault();
    this.dataMaxValue = value;
    return false;
  }

  handleNoDataValueChange(e: any, value: number) {
    e.preventDefault();
    this.noDataValue = value;
    return false;
  }

  handleCloseConfigure(e: any): boolean {
    e.preventDefault();
    this.dismissDataInfo.emit(true);
    $(this.configureModal.nativeElement).modal({show: false});
    return false;
  }
}
