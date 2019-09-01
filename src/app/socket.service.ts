import { SettingsService } from './settings.service';
import { Observable, of } from 'rxjs';
import { Injectable, EventEmitter, Output } from '@angular/core';
import * as io from 'socket.io-client';

import { GeoBounds } from './geo-bounds';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private url = 'localhost:3002';
  // private url = '10.61.141.222:3002';

  private socket;
  private tifDataListArray: any;
  private filteredTifDataListArray: any;

  public geoBounds: GeoBounds;
  public imageDataOverlayObjs: any;
  public user: any;

  constructor(
    private settingsService: SettingsService
  ) {
    this.geoBounds = {
      minLat: -90,
      maxLat: 90,
      minLon: -180,
      maxLon: 180
    };
    this.tifDataListArray = [];
    this.filteredTifDataListArray = [];

    this.socket = io(this.url);
    // this.socket = io();

    this.socket.emit('get-data');
    this.user = {
      isAuthenticated: true
    };
    // this.socket.on('err', ()=>{
    //   console.log("uanble to connect");
    // })
    this.imageDataOverlayObjs = [];
    this.settingsService.clearCacheSubject.subscribe( (isClearCache: boolean) => {
      this.socket.emit('clear-cache', isClearCache);
      this.socket.on('cache-cleared', (cacheCleared: boolean) => {
        setTimeout( () => {
          this.settingsService.cacheClearedSubject.next(cacheCleared);
        }, 100);
      });
    });
  }

  public getDataList(): any {
    return Observable.create( (observer) => {
      this.socket.on('files changed', (payload) => {

        if ( payload && payload.length > 0 ) {
          let _minLat=1000, _maxLat=0, _minLon=1000, _maxLon=0;
          payload.forEach( (elem) => {

              _minLat = elem.geoInfo.coordinates.ullr.lat[1] < _minLat ? elem.geoInfo.coordinates.ullr.lat[1] : _minLat;
              _maxLat = elem.geoInfo.coordinates.ullr.lat[0] > _maxLat ? elem.geoInfo.coordinates.ullr.lat[0] : _maxLat;
              _minLon = elem.geoInfo.coordinates.ullr.lon[0] < _minLon ? elem.geoInfo.coordinates.ullr.lon[0] : _minLon;
              _maxLon = elem.geoInfo.coordinates.ullr.lon[1] > _maxLon ? elem.geoInfo.coordinates.ullr.lon[1] : _maxLon;
          });
          this.geoBounds = {
            minLat: _minLat,
            maxLat: _maxLat,
            minLon: _minLon,
            maxLon: _maxLon
          };
          this.tifDataListArray = payload;
          this.filteredTifDataListArray = payload;

          observer.next(this.filteredTifDataListArray);
        }
      });
    });
  }

  isInsideFull = ( {selectedGeoBounds, dataGeoBounds} ) => {
    return ( 
        dataGeoBounds.lat[0] <= (selectedGeoBounds.lat[0] + 0.001) &&
        dataGeoBounds.lat[1] >= (selectedGeoBounds.lat[1] - 0.001) &&
        dataGeoBounds.lon[0] >= (selectedGeoBounds.lon[0] - 0.001) &&
        dataGeoBounds.lon[1] <= (selectedGeoBounds.lon[1] + 0.001)
    );
  }

  isInsidePartial = ( {selectedGeoBounds, dataGeoBounds} ) => {
    const lonSide1 = selectedGeoBounds.lon[1] - selectedGeoBounds.lon[0];
    const lonSide2 = dataGeoBounds.lon[1] - dataGeoBounds.lon[0];
    const minLon = dataGeoBounds.lon[0] < selectedGeoBounds.lon[0] ?
      dataGeoBounds.lon[0] :
      selectedGeoBounds.lon[0] ;
    const maxLon = dataGeoBounds.lon[1] < selectedGeoBounds.lon[1] ?
      selectedGeoBounds.lon[1] :
      dataGeoBounds.lon[1] ;
    const lonSideSuper = maxLon - minLon;

    const latSide1 = selectedGeoBounds.lat[0] - selectedGeoBounds.lat[1];
    const latSide2 = dataGeoBounds.lat[0] - dataGeoBounds.lat[1];
    const minLat = dataGeoBounds.lat[1] < selectedGeoBounds.lat[1] ? 
      dataGeoBounds.lat[1] :
      selectedGeoBounds.lat[1] ;
    const maxLat = dataGeoBounds.lat[0] < selectedGeoBounds.lat[0] ?
      selectedGeoBounds.lat[0] :
      dataGeoBounds.lat[0] ;
    const latSideSuper = maxLat - minLat;

    return (
        latSideSuper < ( latSide1 + latSide2 ) &&
        lonSideSuper < ( lonSide1 + lonSide2 )
    );
  }

  public filterDatasets( geoBounds: GeoBounds): any {
    const obs = new Observable( (observer) => {
      const selectedGeoBounds = {
          lat: [geoBounds.maxLat, geoBounds.minLat],
          lon: [geoBounds.minLon, geoBounds.maxLon]
      };

      this.filteredTifDataListArray = this.tifDataListArray.filter(
          (elem) =>  {
            return (
              this.settingsService.isPartialIntersect ?
                this.isInsidePartial({
                    selectedGeoBounds,
                    dataGeoBounds: elem.geoInfo.coordinates.ullr
                }) :
                this.isInsideFull({
                  selectedGeoBounds,
                  dataGeoBounds: elem.geoInfo.coordinates.ullr
              })
            );
          }
      );
      observer.next(this.filteredTifDataListArray);
    });
    return obs;
  }

  public getDataAsPng(elemId: string): any {
    const obs = new Observable ( (observer) => {
      this.socket.emit('prepare-data-as-png', { elemId, imageResizePercentage: this.settingsService.imageResizePercentageValue });
      this.socket.on('recieve-data-as-png', (payload) => {
        const elem = this.imageDataOverlayObjs.filter( (elem) => elem.id === payload.id );
        if ( elem.length === 0) {
          this.imageDataOverlayObjs.push(payload);
          observer.next(payload);
        } else {
          if ( elem && elem[0].pngUrl !== payload.pngUrl ) {
            const idx = this.imageDataOverlayObjs.findIndex( elem => elem.id === payload.id );
            this.imageDataOverlayObjs.splice(idx, 1);
            this.imageDataOverlayObjs.push(payload);
            observer.next(payload);
          }
        }
      });
    });
    return obs;
  }

}
