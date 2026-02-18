import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceAreasComponent } from './service-areas.component';

describe('ServiceAreasComponent', () => {
  let component: ServiceAreasComponent;
  let fixture: ComponentFixture<ServiceAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceAreasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
