import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrustpilotSectionComponent } from './trustpilot-section.component';

describe('TrustpilotSectionComponent', () => {
  let component: TrustpilotSectionComponent;
  let fixture: ComponentFixture<TrustpilotSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrustpilotSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrustpilotSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
