import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountDialog } from './account-dialog';

describe('AccountDialog', () => {
  let component: AccountDialog;
  let fixture: ComponentFixture<AccountDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
