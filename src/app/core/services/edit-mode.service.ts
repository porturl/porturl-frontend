import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EditModeService {
  public readonly editMode = signal(false);

  toggleEditMode(): void {
    this.editMode.update(value => !value);
  }
}