import { TestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { provideZonelessChangeDetection } from '@angular/core';

// 1. Initialize the Angular testing environment with the modern modules.
TestBed.initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);

// 2. Configure the root TestBed with the zoneless provider.
// This configuration will apply to all subsequent tests.
TestBed.configureTestingModule({
  providers: [
    provideZonelessChangeDetection(),
  ],
});
