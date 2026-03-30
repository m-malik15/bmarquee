import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordpressPageComponent } from './wordpress-page.component';

describe('WordpressPageComponent', () => {
  let component: WordpressPageComponent;
  let fixture: ComponentFixture<WordpressPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordpressPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordpressPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
