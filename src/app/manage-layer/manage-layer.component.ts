import { Component, OnInit, OnChanges, Input, ViewChild, ElementRef, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';

declare let $: any;

@Component({
  selector: 'app-manage-layer',
  templateUrl: './manage-layer.component.html',
  styleUrls: ['./manage-layer.component.css']
})
export class ManageLayerComponent implements OnInit, OnChanges {

  @Input() modalDisplay: Subject<boolean>;
  @Input() pngDataObjs: any;

  @Output() displayLayerManager: EventEmitter<boolean>;
  @Output() updatePngDataObjs: EventEmitter<any>;

  @ViewChild('manageLayersModal', {static: false}) modal: ElementRef;

  public imageDataObjs: any;
  constructor() {
    this.displayLayerManager = new EventEmitter();
    this.updatePngDataObjs = new EventEmitter();
  }

  ngOnInit() {
    this.imageDataObjs = this.pngDataObjs;
    this.modalDisplay.subscribe( (modalDisplay) => {
      $(this.modal.nativeElement).modal({show: modalDisplay});
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if ( changes.pngDataObjs ) {
      this.imageDataObjs = changes.pngDataObjs.currentValue;
    }
  }

  handleRemoveLayer(e: any, pngDataId: string) {
    this.imageDataObjs = this.pngDataObjs.filter( obj => obj.id !== pngDataId );
  }

  handleCloseLayers(e: any): boolean {
    e.preventDefault();
    this.displayLayerManager.emit(false);
    return false;
  }

  handleSaveLayers(e: any): boolean {
    e.preventDefault();
    this.updatePngDataObjs.emit(this.imageDataObjs);
    this.displayLayerManager.emit(false);
    return false;
  }
}
