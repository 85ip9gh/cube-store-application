import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'cube-store-theme';
// Deliberately still the old brand name. Anyone who visited before the rename
// has their choice stored under this key, and renaming it would silently reset
// them to the system default on their next visit. The same fallback is in
// index.html. Do not "finish the rename" by touching these two.
const LEGACY_STORAGE_KEY = 'cubemint-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // index.html runs an inline script before Angular bootstraps that applies the
  // same stored/prefers-color-scheme choice to <html class="dark">, so reading
  // that class here (instead of re-reading localStorage) keeps this in sync
  // with what the user actually sees on first paint.
  private darkState = new BehaviorSubject<boolean>(document.documentElement.classList.contains('dark'));

  isDark$ = this.darkState.asObservable();

  toggle(): void {
    this.setDark(!this.darkState.value);
  }

  setDark(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    this.darkState.next(dark);
  }
}
