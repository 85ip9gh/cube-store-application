import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'cube-store-theme';
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
