import { ChangeDetectionStrategy, Component, inject, signal, OnInit, OnDestroy, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';
import { PreferencesStore } from '../../core/preferences/preferences.store';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, SidebarComponent, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent implements OnInit, OnDestroy {
  protected readonly prefs = inject(PreferencesStore);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly sidenav = viewChild<MatSidenav>('sidenav');
  readonly isMobile = signal(false);
  readonly sidenavMode = signal<'side' | 'over'>('side');
  readonly sidenavOpened = signal(true);

  private sub?: Subscription;

  ngOnInit(): void {
    this.sub = this.breakpointObserver
      .observe(['(max-width: 1024px)'])
      .subscribe((result) => {
        const mobile = result.matches;
        this.isMobile.set(mobile);
        if (mobile) {
          this.sidenavMode.set('over');
          this.sidenavOpened.set(false);
        } else {
          this.sidenavMode.set('side');
          this.sidenavOpened.set(true);
        }
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleSidenav(): void {
    this.sidenav()?.toggle();
  }

  onSidenavLinkClicked(): void {
    if (this.isMobile()) {
      this.sidenav()?.close();
    }
  }
}
