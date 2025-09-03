import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * A singleton service to manage and broadcast global error messages.
 * This is useful for communicating backend connection issues from the
 * data layer (ApiService) to the UI layer (Components).
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  private errorSource = new BehaviorSubject<string | null>(null);

  /**
   * An observable that components can subscribe to in order to receive
   * the latest error message.
   */
  error$ = this.errorSource.asObservable();

  /**
   * Displays a new error message to all subscribers.
   * @param message The error message to display.
   */
  showError(message: string) {
    this.errorSource.next(message);
  }

  /**
   * Clears the current error message.
   */
  clearError() {
    this.errorSource.next(null);
  }
}
