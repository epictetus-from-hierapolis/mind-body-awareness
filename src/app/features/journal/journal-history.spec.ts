import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalHistoryComponent } from './journal-history-component';

describe('JournalHistoryComponent', () => {
  let component: JournalHistoryComponent;
  let fixture: ComponentFixture<JournalHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JournalHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JournalHistoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
