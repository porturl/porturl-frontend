import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { OAuthService } from 'angular-oauth2-oidc';
import { ApiService, Application } from '../api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Use OnPush with zoneless
})
export class DashboardComponent implements OnInit {
  applications: Application[] = [];
  userName = '';
  addForm: FormGroup;
  editForm: FormGroup;
  editingApp: Application | null = null;

  constructor(
    private oauthService: OAuthService,
    private apiService: ApiService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
) {

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

  loadApplications(): void {
    this.apiService.getApplications().subscribe(apps => {
      this.applications = apps;
      // Manually tell Angular to check for updates
      this.cdr.markForCheck();
    });
  }

  onAdd(): void {
    if (this.addForm.valid) {
      this.apiService.addApplication(this.addForm.value).subscribe(() => {
        this.loadApplications(); // This will fetch and then mark for check
        this.addForm.reset();
        this.cdr.markForCheck(); // Mark for check after form reset
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
    // Mark for check as we've changed the component's state
    this.cdr.markForCheck();
  }

  onSaveEdit(): void {
    if (this.editForm.valid && this.editingApp?.id) {
      this.apiService.updateApplication(this.editingApp.id, this.editForm.value).subscribe(() => {
        this.loadApplications(); // Fetches and marks for check
        this.cancelEdit();
      });
    }
  }

  cancelEdit(): void {
    this.editingApp = null;
    this.editForm.reset();
    this.cdr.markForCheck();
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this application?')) {
      this.apiService.deleteApplication(id).subscribe(() => {
        this.loadApplications(); // Fetches and marks for check
      });
    }
  }

  logout(): void {
    this.oauthService.logOut();
  }
}
