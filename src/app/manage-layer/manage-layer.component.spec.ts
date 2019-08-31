import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageLayerComponent } from './manage-layer.component';

describe('ManageLayerComponent', () => {
  let component: ManageLayerComponent;
  let fixture: ComponentFixture<ManageLayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageLayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
