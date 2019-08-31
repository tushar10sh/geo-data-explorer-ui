import { GeoBounds } from './../geo-bounds';
import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { SocketService } from './../socket.service';

@Component({
  selector: 'app-data-filter',
  templateUrl: './data-filter.component.html',
  styleUrls: ['./data-filter.component.css']
})
export class DataFilterComponent implements OnInit, OnChanges {

  @Input() geoBounds: GeoBounds;

  @Output() latLonChanged : EventEmitter<GeoBounds>;

  constructor( 
  ) {
    this.geoBounds = {
      minLat: -90,
      maxLat: 90,
      minLon: -180,
      maxLon: 180
    };
    this.latLonChanged = new EventEmitter;
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
  }

  handleLatLonChange(
    propNumber: number,
    newValue  : any
  ) {
    let emitEvent = true;
    let minLat = this.geoBounds.minLat;
    let maxLat = this.geoBounds.maxLat;
    let minLon = this.geoBounds.minLon;
    let maxLon = this.geoBounds.maxLon;

    switch( propNumber ) {
      case 0: minLat = parseFloat(newValue);
              break;
      case 1: maxLat = parseFloat(newValue);
              break;
      case 2: minLon = parseFloat(newValue);
              break;      
      case 3: maxLon = parseFloat(newValue);
              break;
      default:
              emitEvent = false;
              break;
    }
    if ( emitEvent ) {

      let newGeoBounds: GeoBounds = { 
        minLat: minLat,
        maxLat: maxLat,
        minLon: minLon,
        maxLon: maxLon
      };

      this.latLonChanged.emit(newGeoBounds);
    }
    
    
  }

}
