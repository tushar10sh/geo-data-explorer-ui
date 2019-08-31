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

  @ViewChild('settingsModal', {static: false}) modal: ElementRef;

  private settingsHidden: boolean;

  constructor(
    public settingsService: SettingsService
  ) {
    this.showManageLayerDialog = new EventEmitter();
    this.settingsHidden = true;
    this.isPartialIntersect = this.settingsService.isPartialIntersect;
  }

  ngOnInit() {
  }

  showSettings(e: any): boolean {
    e.preventDefault();
    this.settingsHidden = false;
    this.isPartialIntersect = this.settingsService.isPartialIntersect;
    $(this.modal.nativeElement).modal({show: !this.settingsHidden});
    return false;
  }

  handleCheckboxClick(e: any, value: any): boolean {
    this.isPartialIntersect = !this.isPartialIntersect;
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
    return false;
  }

  showManageLayers(e: any): boolean {
    e.preventDefault();
    this.showManageLayerDialog.emit(true);
    return false;
  }
}
