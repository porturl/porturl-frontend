import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ApplicationDialog } from './application-dialog';

describe('ApplicationDialog', () => {
  let component: ApplicationDialog;
  let fixture: ComponentFixture<ApplicationDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ApplicationDialog,
        NoopAnimationsModule // Required for Material components with animations
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { categories: [] } } // Provide mock data
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});