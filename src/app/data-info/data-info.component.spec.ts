import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataInfoComponent } from './data-info.component';

describe('DataInfoComponent', () => {
  let component: DataInfoComponent;
  let fixture: ComponentFixture<DataInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
