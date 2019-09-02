import { SettingsService } from './../settings.service';
import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';

declare let $: any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  @Input() title: string;
  @Output() showManageLayerDialog: EventEmitter<boolean>;

  public isPartialIntersect: boolean;
  public imageResizePercentageValue: number;

  @ViewChild('settingsModal', {static: false}) modal: ElementRef;

  private settingsHidden: boolean;
  private cacheCleared: boolean;

  private dataMinValue: number;
  private dataMaxValue: number;
  private noDataValue: number;

  constructor(
    public settingsService: SettingsService
  ) {
    this.showManageLayerDialog = new EventEmitter();
    this.settingsHidden = true;
    this.isPartialIntersect = this.settingsService.isPartialIntersect;
    this.imageResizePercentageValue = this.settingsService.imageResizePercentageValue;
    this.cacheCleared = false;
  }

  ngOnInit() {
    this.settingsService.cacheClearedSubject.subscribe( (cacheCleared) => {
      this.cacheCleared = cacheCleared;
      setTimeout( () => {
        this.cacheCleared = false;
      }, 2000);
    });
    this.dataMinValue = this.settingsService.dataMinValue;
    this.dataMaxValue = this.settingsService.dataMaxValue;
    this.noDataValue = this.settingsService.noDataValue;
  }

  showSettings(e: any): boolean {
    e.preventDefault();
    this.settingsHidden = false;
    this.isPartialIntersect = this.settingsService.isPartialIntersect;
    this.imageResizePercentageValue = this.settingsService.imageResizePercentageValue;
    $(this.modal.nativeElement).modal({show: !this.settingsHidden});
    return false;
  }

  handleCheckboxClick(e: any, value: any): boolean {
    this.isPartialIntersect = !this.isPartialIntersect;
    return false;
  }

  handleResizePercentangeChange(e: any, value: number): boolean {
    e.preventDefault();
    this.imageResizePercentageValue = value;
    return false;
  }

  handleCacheClear(e: any) {
    e.preventDefault();
    this.settingsService.clearCacheSubject.next(true);
    return false;
  }

  handleCloseSettings(e: any): boolean {
    this.settingsHidden = true;
    $(this.modal.nativeElement).modal({show: !this.settingsHidden});
    return false;
  }

  handleSaveSettings(e: any): boolean {
    e.preventDefault();
    this.settingsService.isPartialIntersect = this.isPartialIntersect;
    this.settingsService.imageResizePercentageValue = this.imageResizePercentageValue;

    this.settingsService.dataMinValue = this.dataMinValue;
    this.settingsService.dataMaxValue = this.dataMaxValue;
    this.settingsService.noDataValue = this.noDataValue;
    return false;
  }

  showManageLayers(e: any): boolean {
    e.preventDefault();
    this.showManageLayerDialog.emit(true);
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
}
