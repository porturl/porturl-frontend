import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Application, Category } from '../../core/models/data.models';

export interface ApplicationDialogData {
  application?: Application;
  categories: Category[];
  applicationCategoryIds?: string[];
}

@Component({
  selector: 'app-application-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
  ],
  templateUrl: './application-dialog.html',
  styleUrl: './application-dialog.scss',
})
export class ApplicationDialog {
  private readonly fb = inject(FormBuilder);
  public form = this.fb.group({
    name: ['', Validators.required],
    url: ['', Validators.required],
    icon: [''],
    categoryIds: [[] as string[], Validators.required],
  });

  public allCategories: Category[] = [];

  constructor(
    public dialogRef: MatDialogRef<ApplicationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: ApplicationDialogData
  ) {
    this.allCategories = data.categories;
    if (data.application) {
      this.form.patchValue(data.application);
      if (data.applicationCategoryIds) {
        this.form.controls.categoryIds.setValue(data.applicationCategoryIds);
      }
    }
  }

  toggleCategorySelection(categoryId: string): void {
    const currentIds = this.form.controls.categoryIds.value || ([] as string[]);
    const newIds = [...currentIds];
    const index = newIds.indexOf(categoryId);

    if (index > -1) {
      newIds.splice(index, 1);
    } else {
      newIds.push(categoryId);
    }
    this.form.controls.categoryIds.setValue(newIds);
  }

  isSelected(categoryId: string): boolean {
    const currentIds = this.form.controls.categoryIds.value || ([] as string[]);
    return currentIds.includes(categoryId);
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}