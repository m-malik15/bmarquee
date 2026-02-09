import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeQuoteComponent } from './free-quote.component';

describe('FreeQuoteComponent', () => {
  let component: FreeQuoteComponent;
  let fixture: ComponentFixture<FreeQuoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FreeQuoteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FreeQuoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
