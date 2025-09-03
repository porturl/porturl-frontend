import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OAuthService } from 'angular-oauth2-oidc';
import { ApiService, Application } from '../api.service';
import { ErrorService } from '../error.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Using OnPush for better performance
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName = '';
  applications: Application[] = [];
  editingApp: Application | null = null;

  // This property will hold the error message directly, ensuring reliable UI updates.
  public errorMessage: string | null = null;
  private errorSubscription: Subscription;

  addForm: FormGroup;
  editForm: FormGroup;

  constructor(
    private oauthService: OAuthService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private errorService: ErrorService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef for OnPush
  ) {
    // Manually subscribe to the error service. This is more robust than the async pipe
    // for triggering change detection from a background service.
    this.errorSubscription = this.errorService.error$.subscribe(message => {
      this.errorMessage = message;
      // Manually tell Angular to check this component for updates, as the
      // change came from an external service.
      this.cdr.markForCheck();
    });

    this.addForm = this.fb.group({
      name: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });

    this.editForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('https?://.+')]]
    });
  }

  ngOnInit(): void {
    const claims = this.oauthService.getIdentityClaims();
    if (claims && typeof claims === 'object' && 'name' in claims) {
      this.userName = claims['name'] as string;
    }
    this.loadApplications();
  }

  ngOnDestroy(): void {
    // It's a best practice to unsubscribe to prevent memory leaks.
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }

  loadApplications(): void {
    this.apiService.getApplications().subscribe({
      next: (data) => {
        // We only clear the error message on a SUCCESSFUL API call.
        this.errorService.clearError();
        this.applications = data;
        this.cdr.markForCheck(); // Mark view for update
      },
      error: () => {
        // The ApiService sets the error, which our subscription will pick up.
        // We just need to clear the local data state.
        this.applications = [];
        this.cdr.markForCheck(); // Mark view for update
      }
    });
  }

  onAdd(): void {
    if (this.addForm.valid) {
      this.apiService.addApplication(this.addForm.value).subscribe({
        next: () => {
          this.loadApplications(); // This will clear the error and mark for check on success
          this.addForm.reset();
        },
        error: () => { /* The error is handled by the subscription */ }
      });
    }
  }

  onEdit(app: Application): void {
    this.editingApp = app;
    this.editForm.setValue({
      id: app.id,
      name: app.name,
      url: app.url
    });
    this.cdr.markForCheck(); // Mark view for update
  }

  onSaveEdit(): void {
    if (this.editForm.valid) {
      const { id, ...appData } = this.editForm.value;
      this.apiService.updateApplication(id, appData).subscribe({
        next: () => {
          this.loadApplications(); // Clears error and marks for check on success
          this.cancelEdit();
        },
        error: () => { /* The error is handled by the subscription */ }
      });
    }
  }

  cancelEdit(): void {
    this.editingApp = null;
    this.editForm.reset();
    this.cdr.markForCheck(); // Mark view for update
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this application?')) {
      this.apiService.deleteApplication(id).subscribe({
        next: () => {
          this.loadApplications(); // Clears error and marks for check on success
        },
        error: () => { /* The error is handled by the subscription */ }
      });
    }
  }

  logout(): void {
    this.oauthService.logOut();
  }
}

