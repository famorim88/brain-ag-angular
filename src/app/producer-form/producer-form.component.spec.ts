import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProducerFormComponent } from './producer-form.component';

describe('ProducerFormComponent', () => {
  let component: ProducerFormComponent;
  let fixture: ComponentFixture<ProducerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProducerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProducerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
