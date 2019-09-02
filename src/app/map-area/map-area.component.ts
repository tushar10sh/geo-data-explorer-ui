import {
  Component,
  OnInit,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { Subject } from 'rxjs';

import { imageOverlay, tileLayer, latLng, rectangle, polyline, latLngBounds, LatLngBoundsExpression, LatLng, Rectangle } from 'leaflet';
import { Control, DomUtil } from 'leaflet';

import { GeoBounds } from './../geo-bounds';
declare let L;
import 'leaflet-draw';
import { bufferTime } from 'rxjs/operators';
declare let $: any;

@Component({
  selector: 'app-map-area',
  templateUrl: './map-area.component.html',
  styleUrls: ['./map-area.component.css']
})
export class MapAreaComponent implements OnInit, OnChanges {

  @Input() geoBounds: GeoBounds;
  @Input() tifDataListArray: any;
  @Input() colorArray: any;
  @Input() highlightRectangle: Subject< [string, boolean] >;
  @Input() reloadSubject: Subject<boolean>;
  @Input() panRectangleWithId: Subject<string>;

  @Input() imageDataOverlayObjSubject: Subject<any>;
  @Input() removeDataOverlayObjSubject: Subject<any>;

  @Output() latLonChanged: EventEmitter<GeoBounds>;

  rectangles: any;
  options: any;
  drawOptions: any;
  boundingBox: any;

  oldColor: string;

  public latLngString: string = 'Lat: 0.0, Lng: 0.0';
  public imageDataOverlays: any;
  private rectangleToggleText: string = 'on';

  private rectangleToggle;
  private showRectangles: boolean;

  constructor(
    private changeDetector: ChangeDetectorRef
  ) {
    this.geoBounds = {
      minLat: -90,
      maxLat: 90,
      minLon: -180,
      maxLon: 180
    };
    this.colorArray = [];
    this.latLonChanged = new EventEmitter();
    this.oldColor = '';

    this.rectangles = {ids:[], rects:[]};
    this.options = {
      layers: [
        tileLayer(
          // 'http://10.61.141.217:8092/osm_tiles/{z}/{x}/{y}.png',
          'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { maxZoom: 18, attribution: '...' }
        )
      ],
      zoom: 5,
      center: latLng(23, 72)
    };

    this.drawOptions = {
      position: 'topleft',
      draw: {
         marker: false,
         polyline: false,
         polygon: false,
         circle: false,
         circlemarker: false,
         rectangle: true
      }
    };

    this.boundingBox = null;
    this.imageDataOverlays = [];
    const RectangleToggleControl = Control.extend({
      onAdd: (map) => {
        const btn = DomUtil.create('button');
        btn.className = 'btn btn-sm btn-primary';
        btn.innerHTML = `
          <small class='mr-1'>Rectangles</small>
          <span class='badge badge-light'>
            ${this.rectangleToggleText}
          </span>`;
        btn.onclick = (e) => {
          this.handleToggleRectangles(e);
          btn.innerHTML = `
          <small class='mr-1'>Rectangles</small>
          <span class='badge badge-light'>
            ${this.rectangleToggleText}
          </span>`;
        };
        return btn;
      },
      onRemove: (map) => {
      }
    });
    this.showRectangles = true;
    // const LatLngControl = Control.extend({
    //   onAdd: (map) => {
    //     const span = DomUtil.create('span');
    //     span.innerHTML = `${this.latLngString}`;
    //     return span;
    //   },
    //   onRemove: (map) => {
    //   }
    // });
    this.rectangleToggle = (opts) => {
      return new RectangleToggleControl(opts);
    };
    // this.latLngDisplay = (opts) => {
    //   return new LatLngControl(opts);
    // };
  }

  repositionMap() {
    if ( this.geoBounds ) {
      const center = [
        (this.geoBounds.maxLat + this.geoBounds.minLat) / 2 ,
        (this.geoBounds.maxLon + this.geoBounds.minLon) / 2
      ];
      this.options = { ...this.options, center: latLng( center[0], center[1]) };
    }
  }

  drawRectangles() {
    this.rectangles = {ids:[], rects:[]};
    if ( this.tifDataListArray ) {
      console.log(this.tifDataListArray.length);
      this.tifDataListArray.forEach( elem => {
        const color = this.colorArray.filter( e => e.elemId === elem.id )[0].color;
        const maxlat = elem.geoInfo.coordinates.ullr.lat[0];
        const minlat = elem.geoInfo.coordinates.ullr.lat[1];
        const minlon = elem.geoInfo.coordinates.ullr.lon[0];
        const maxlon = elem.geoInfo.coordinates.ullr.lon[1];
        const bbpoints = [
          [minlat, minlon],
          [maxlat, minlon],
          [maxlat, maxlon],
          [minlat, maxlon],
          [minlat, minlon]
        ];

        const rect = polyline(bbpoints, { color, weight: 2});
        this.rectangles.ids.push(elem.id);
        this.rectangles.rects.push(rect);
      });
    }
  }

  removeRectangles() {
    if (this.rectangles.rects.length > 0) {
      this.imageDataOverlays = [];
      this.rectangles.rects.forEach( rect => rect.remove() );
      this.rectangles = {ids: [], rects: []};
    }
  }

  ngOnInit() {
    this.repositionMap();
    this.reloadSubject.subscribe( (data) => {
      if ( this.boundingBox != null ) {
        this.boundingBox.remove();
        this.boundingBox = null;
      }
    });

    this.highlightRectangle.subscribe( (data) => {
      const elemId = data[0];
      const isHighlighted = data[1];

      const dataElem = this.tifDataListArray.filter( elem => elem.id === elemId )[0];
      if ( dataElem ) {
        const maxlat = dataElem.geoInfo.coordinates.ullr.lat[0];
        const minlat = dataElem.geoInfo.coordinates.ullr.lat[1];
        const minlon = dataElem.geoInfo.coordinates.ullr.lon[0];
        const maxlon = dataElem.geoInfo.coordinates.ullr.lon[1];
        const bbpoints = [
          [minlat, minlon],
          [maxlat, minlon],
          [maxlat, maxlon],
          [minlat, maxlon],
          [minlat, minlon]
        ];

        const rect = polyline(
          bbpoints,
          { color: isHighlighted ? '#ff1111' : this.oldColor,
            weight: isHighlighted ? 3 : 2
          }
        );

        const idx = this.rectangles.ids.findIndex( rid => rid === elemId );
        this.oldColor = this.rectangles.rects[idx].options.color;
        this.rectangles.rects.splice(idx, 1);
        this.rectangles.ids.splice(idx, 1);
        this.rectangles.rects.push(rect);
        this.rectangles.ids.push(elemId);
      }
    });

  }

  ngOnChanges(changes: SimpleChanges) {
    if ( this.geoBounds ) {

      if ( changes.geoBounds ) {
        if ( changes.geoBounds.currentValue.minLat === 1000 ) {
          this.geoBounds.minLat = changes.geoBounds.previousValue.minLat;
        }

        if ( changes.geoBounds.currentValue.maxLat === 0 ) {
          this.geoBounds.maxLat = changes.geoBounds.previousValue.maxLat;
        }

        if (changes.geoBounds.currentValue.minLon === 1000) {
          this.geoBounds.minLon = changes.geoBounds.previousValue.minLon;
        }

        if (changes.geoBounds.currentValue.maxLon === 0) {
          this.geoBounds.maxLon = changes.geoBounds.previousValue.maxLon;
        }

        this.repositionMap();
      }

      if ( changes.tifDataListArray ) {
        this.removeRectangles();
        this.drawRectangles();
      }
    }
  }

  onMapReady(e: any) {
    // this.latLngDisplay({ position: 'topright'}).addTo(e);
    this.rectangleToggle({ position: 'topright'}).addTo(e);

    this.panRectangleWithId.subscribe( (elemId) => {
      const idx = this.rectangles.ids.findIndex( rid => rid === elemId );
      if ( idx >= 0 ) {
        const rect = this.rectangles.rects[idx];
        // e.fitBounds(rect.getBounds());
        e.flyToBounds(rect.getBounds());
      }
    });

    this.imageDataOverlayObjSubject.subscribe( pngDataObj => {
      if ( pngDataObj ) {
        let imageDataOverlay = [];
        imageDataOverlay = this.imageDataOverlays.filter( obj => obj.pngDataObj.id === pngDataObj.id );
        // If objs is not found add to imageDataOverlays and on map
        if ( imageDataOverlay.length === 0 ) {
          imageDataOverlay = [ imageOverlay(pngDataObj.pngUrl, pngDataObj.bounds) ];
          this.imageDataOverlays.push(
            {
              pngDataObj,
              imageOverlayObj: imageDataOverlay[0]
            }
          );
          imageDataOverlay[0].addTo(e);
        } else {
          if ( imageDataOverlay && imageDataOverlay[0].pngUrl !== pngDataObj.pngUrl ) {
            const idx = this.imageDataOverlays.findIndex( obj => obj.pngDataObj.id === pngDataObj.id );
            this.imageDataOverlays[idx].imageOverlayObj.remove();
            imageDataOverlay = [ imageOverlay(pngDataObj.pngUrl, pngDataObj.bounds) ];
            this.imageDataOverlays.splice(idx, 1);
            this.imageDataOverlays.push(
              {
                pngDataObj,
                imageOverlayObj: imageDataOverlay[0]
              }
            );
            imageDataOverlay[0].addTo(e);
          }
        }
      }
    });

    this.removeDataOverlayObjSubject.subscribe( pngDataObj => {
      if ( pngDataObj ) {
        const foundImageDataOverlayObj = this.imageDataOverlays.filter( obj => obj.pngDataObj.id === pngDataObj.id );
        if ( foundImageDataOverlayObj.length === 1) {
          foundImageDataOverlayObj[0].imageOverlayObj.remove();
          this.imageDataOverlays = this.imageDataOverlays.filter( obj => obj.pngDataObj.id !== pngDataObj.id );
        }
      }
    });
  }

  onMapMouseMove(e: any) {
    this.latLngString = `Lat: ${e.latlng.lat.toFixed(3)}, Lng: ${e.latlng.lng.toFixed(3)}`;
  }

  handleDrawStart(e: any) {
    if ( this.boundingBox !== null ) {
      this.boundingBox.remove();
      this.boundingBox = null;
    }
  }

  handleDrawRectangle(e: any) {
    if ( e.layerType === 'rectangle' ) {
      if ( this.boundingBox !== null ) {
        this.boundingBox.remove();
      }
      this.boundingBox = e.layer;
      const bbox = this.boundingBox.getBounds();
      const nw = bbox.getNorthWest();
      const se = bbox.getSouthEast();

      const newGeoBounds: GeoBounds = {
        minLat: se.lat,
        maxLat: nw.lat,
        minLon: nw.lng,
        maxLon: se.lng
      };
      this.latLonChanged.emit(newGeoBounds);
    }
  }

  handleEditRectangle(e: any) {
    if ( e.layers.getLayers().length === 1 ) {

      this.boundingBox = e.layers.getLayers()[0];
      const bbox = this.boundingBox.getBounds();
      const nw = bbox.getNorthWest();
      const se = bbox.getSouthEast();

      const newGeoBounds: GeoBounds = {
        minLat: se.lat,
        maxLat: nw.lat,
        minLon: nw.lng,
        maxLon: se.lng
      };
      this.latLonChanged.emit(newGeoBounds);
    }
  }

  handleToggleRectangles(e: any): boolean {
    e.preventDefault();
    this.rectangleToggleText = this.rectangleToggleText === 'on' ? 'off' : 'on';
    if ( this.rectangleToggleText === 'off' ) {
      this.showRectangles = false;
    } else {
      this.showRectangles = true;
    }
    return false;
  }

}
