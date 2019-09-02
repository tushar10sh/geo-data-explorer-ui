import { Component, OnInit } from '@angular/core';
import { SocketService } from './socket.service';
import { GeoBounds } from './geo-bounds';
import { rectangle } from 'leaflet';

import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'geo-data-filter';
  minLat = -90;
  maxLat = 90;
  minLon = -180;
  maxLon = 180;
  geoBounds: GeoBounds;
  tifDataListArray: any;
  colorArray: any;

  paginatedResult: any;
  public resultCountSubject: Subject<[number, number, number]> = new Subject();

  private itemsPerPage: number;
  public totalPages: number;
  public currentPage: number;

  public dataInfo: any;
  public highlightRectangle: Subject<[string, boolean]>;

  private searchResults: any;
  public noSearchResultsFound: boolean;
  public searchPlaceholder: string;

  public reloadSubject: Subject<boolean>;
  public panRectangleWithId: Subject<string>;

  public imageDataOverlayObjSubject: Subject<any> = new Subject();
  public removeDataOverlayObjSubject: Subject<any> = new Subject();

  public showLayerManager: Subject<boolean> = new Subject();

  constructor(
    public socketService: SocketService
  ) {
    this.geoBounds = {
      minLat: -90,
      maxLat: 90,
      minLon: -180,
      maxLon: 180
    };

    this.totalPages = 0;
    this.itemsPerPage = 10;
    this.currentPage = 0;
    this.dataInfo = {
      hidden: true,
      title: "No title",
      info: ""
    };
    this.searchResults = [];
    this.noSearchResultsFound = false;
    this.searchPlaceholder = "Search ...";

    this.reloadSubject = new Subject<boolean>();
    this.highlightRectangle = new Subject();
    this.panRectangleWithId = new Subject();

  }

  getRandomColor(): string {
    let letters: string = '0123456789ABCDEF';
    let color: string = '#';
    for ( let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  loadPaginatedResults(page: number) {
    if ( !(this.searchResults.length > 0) ) {
      this.totalPages = Math.ceil(this.tifDataListArray.length / this.itemsPerPage);
      if ( page >= 0 && page < this.totalPages ) {
        this.currentPage = page;
        this.paginatedResult =
          this.tifDataListArray.slice(
            this.currentPage * this.itemsPerPage,
            (this.currentPage + 1) * this.itemsPerPage
          );
        const startCount = this.currentPage * this.itemsPerPage + 1;
        const endCount = (this.currentPage + 1) * this.itemsPerPage > this.tifDataListArray.length ?
          this.tifDataListArray.length :
          (this.currentPage + 1) * this.itemsPerPage;
        const totalCount = this.tifDataListArray.length;
        setTimeout( () => {
          this.resultCountSubject.next([startCount, endCount, totalCount]);
        }, 100);
      }
    } else {
      this.totalPages = Math.ceil(this.searchResults.length / this.itemsPerPage);
      if ( page >= 0 && page < this.totalPages ) {
        this.currentPage = page;
        this.paginatedResult =
          this.searchResults.slice(
            this.currentPage * this.itemsPerPage,
            (this.currentPage + 1) * this.itemsPerPage
          );
        const startCount = this.currentPage * this.itemsPerPage + 1;
        const endCount = (this.currentPage + 1) * this.itemsPerPage > this.searchResults.length ?
          this.searchResults.length :
          (this.currentPage + 1) * this.itemsPerPage;
        const totalCount = this.searchResults.length;
        setTimeout( () => {
          this.resultCountSubject.next([startCount, endCount, totalCount]);
        }, 100);
      }
    }
  }

  getDataFromService(): void {
    this.searchResults = [];
    this.searchPlaceholder = 'Search ...';

    this.socketService.getDataList().subscribe(
      (data) => {
        if ( data.length > 0 ) {
          this.tifDataListArray = data;
          this.colorArray = this.tifDataListArray.map ( elem => {
            return ({
              elemId : elem.id ,
              color : this.getRandomColor()
            });
          });
          this.noSearchResultsFound = false;

        } else {
          this.tifDataListArray = [];
          this.paginatedResult = [];
          this.colorArray = [];
          this.noSearchResultsFound = true;

        }
        this.geoBounds = this.socketService.geoBounds;

        this.loadPaginatedResults(0);
      },
      (error) => {

      }
    );
  }

  ngOnInit() {
    this.getDataFromService();
  }

  showManageLayerDialog(display: boolean) {
    this.showLayerManager.next(display);
  }

  handleLatLonChange(geoBounds: GeoBounds): boolean {
    this.searchResults = [];
    this.noSearchResultsFound = false;
    this.geoBounds = geoBounds;
    this.searchPlaceholder = 'Search ...';

    this.socketService.filterDatasets(geoBounds).subscribe(
      (data) => {
        if ( data.length > 0 ) {
          this.tifDataListArray = data;
          this.noSearchResultsFound = false;
        } else {
          this.tifDataListArray = [];
          this.paginatedResult = [];
          this.noSearchResultsFound = true;
        }
        this.loadPaginatedResults(0);
      },
      (error) => {

      }
    );
    return false;
  }

  handleReload(e: any): boolean {
    e.preventDefault();

    this.searchResults = [];
    this.noSearchResultsFound = false;
    this.searchPlaceholder = 'Search ...';

    this.geoBounds = this.socketService.geoBounds;

    this.reloadSubject.next(true);

    this.socketService.filterDatasets(this.geoBounds).subscribe(
      (data) => {
        if ( data.length > 0 ) {
          this.tifDataListArray = data;
          this.noSearchResultsFound = false;
        } else {
          this.tifDataListArray = [];
          this.paginatedResult = [];
          this.noSearchResultsFound = true;
        }
        this.loadPaginatedResults(0);
      },
      (error) => {

      }
    )
    return false;
  }

  handleSearchOnTable(searchString: string): boolean {
    this.searchPlaceholder = searchString;
    if ( searchString === '' ) {
      this.searchResults = [];
      this.noSearchResultsFound = false;
      this.searchPlaceholder = 'Search ...';
    } else {
      this.searchResults = this.tifDataListArray.filter( (elem) => {
        if ( elem.fileName ) {
          return elem.fileName.toLowerCase().includes(searchString.toLowerCase());
        }
      });
      if ( this.searchResults.length === 0) {
        this.noSearchResultsFound = true;
      } else {
        this.noSearchResultsFound = false;
      }
    }
    this.loadPaginatedResults(0);
    return false;
  }

  handlePageChange(currentPage: number): boolean {
    this.loadPaginatedResults(currentPage);
    return false;
  }

  handleRowClick(elemId: string): boolean {
    this.dataInfo.hidden = false;
    this.dataInfo.title = 'Data Information';
    const elem = this.tifDataListArray.filter( (elem) => elem.id === elemId );
    if ( elem.length === 1 ) {
      this.dataInfo.info = elem[0];
      this.panRectangleWithId.next(elemId);
    }
    return false;
  }

  handleRowEnter(elemId: string): boolean {
    this.highlightRectangle.next([elemId, true]);
    return false;
  }

  handleRowLeave(elemId: string): boolean {
    this.highlightRectangle.next([elemId, false]);
    return false;
  }

  handleShowDataOnMap(data) {
    const elemId: string = data[0];
    const imageResizePercentage: number = data[1];
    const dataMinValue: number = data[2];
    const dataMaxValue: number = data[3];
    const noDataValue: number = data[4];
    this.socketService.getDataAsPng(elemId, imageResizePercentage, dataMinValue, dataMaxValue, noDataValue).subscribe( (pngDataObj) => {
      this.imageDataOverlayObjSubject.next(pngDataObj);
    });
  }

  handleDataInfoClose(e: any) {
    this.dataInfo.hidden = true;
  }

  updatePngDataObjs(pngDataObjs: any) {
    this.socketService.imageDataOverlayObjs.forEach( obj => {
      const foundObj = pngDataObjs.filter( newObj => newObj.id === obj.id );
      if ( foundObj.length === 0 ) {
        this.removeDataOverlayObjSubject.next(obj);
      }
    });
    this.socketService.imageDataOverlayObjs = pngDataObjs;
  }
}
