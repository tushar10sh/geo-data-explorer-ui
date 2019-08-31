import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { DataFilterComponent } from './data-filter/data-filter.component';
import { DataListComponent } from './data-list/data-list.component';
import { MapAreaComponent } from './map-area/map-area.component';

import { SocketService } from './socket.service';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';
import { PaginationComponent } from './pagination/pagination.component';
import { DataInfoComponent } from './data-info/data-info.component';
import { DataTableFilterComponent } from './data-table-filter/data-table-filter.component';
import { ManageLayerComponent } from './manage-layer/manage-layer.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DataFilterComponent,
    DataListComponent,
    MapAreaComponent,
    PaginationComponent,
    DataInfoComponent,
    DataTableFilterComponent,
    ManageLayerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LeafletModule.forRoot(),
    LeafletDrawModule.forRoot()
  ],
  providers: [
    SocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
