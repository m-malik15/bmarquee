import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsAccreditationsComponent } from './clients-accreditations.component';

describe('ClientsAccreditationsComponent', () => {
  let component: ClientsAccreditationsComponent;
  let fixture: ComponentFixture<ClientsAccreditationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsAccreditationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientsAccreditationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
