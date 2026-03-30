import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryDemoComponent } from './gallery-demo.component';

describe('GalleryDemoComponent', () => {
  let component: GalleryDemoComponent;
  let fixture: ComponentFixture<GalleryDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GalleryDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
