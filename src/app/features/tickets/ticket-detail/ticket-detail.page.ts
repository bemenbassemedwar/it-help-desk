import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslocoModule } from '@jsverse/transloco';
import { TicketDetailViewModel } from './ticket-detail.view-model';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/ui/priority-badge/priority-badge.component';
import { UserAvatarComponent } from '../../../shared/ui/user-avatar/user-avatar.component';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { CommentType, Priority } from '../../../models/enums';

@Component({
  selector: 'app-ticket-detail-page',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    MatTabsModule,
    TranslocoModule,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    UserAvatarComponent,
    RelativeTimePipe,
  ],
  providers: [TicketDetailViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-detail.page.html',
  styleUrl: './ticket-detail.page.scss',
})
export class TicketDetailPage implements OnInit {
  protected readonly vm = inject(TicketDetailViewModel);
  private readonly location = inject(Location);

  readonly id = input.required<string>();

  protected selectedAssigneeId = '';
  protected resolutionNote = '';
  protected reopenReason = '';
  protected commentText = '';
  protected commentType: CommentType = 'PUBLIC';
  protected showReopenForm = false;
  protected readonly priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  protected selectedPriority: Priority | '' = '';

  ngOnInit(): void {
    this.vm.load(this.id());
  }

  protected onBack(): void {
    this.location.back();
  }

  protected async onAssign(): Promise<void> {
    if (this.selectedAssigneeId) {
      await this.vm.assign(this.selectedAssigneeId);
      this.selectedAssigneeId = '';
    }
  }

  protected async onReassign(): Promise<void> {
    if (this.selectedAssigneeId) {
      await this.vm.reassign(this.selectedAssigneeId);
      this.selectedAssigneeId = '';
    }
  }

  protected async onStartWork(): Promise<void> {
    await this.vm.startWork();
  }

  protected async onSubmitVerification(): Promise<void> {
    if (this.resolutionNote.length >= 20) {
      await this.vm.submitVerification(this.resolutionNote);
      this.resolutionNote = '';
    }
  }

  protected async onConfirmResolution(): Promise<void> {
    await this.vm.confirmResolution();
  }

  protected async onReopen(): Promise<void> {
    if (this.reopenReason.length >= 10) {
      await this.vm.reopen(this.reopenReason);
      this.reopenReason = '';
      this.showReopenForm = false;
    }
  }

  protected async onSetPriority(): Promise<void> {
    if (this.selectedPriority) {
      await this.vm.setPriority(this.selectedPriority);
      this.selectedPriority = '';
    }
  }

  protected async onAddComment(): Promise<void> {
    if (this.commentText.trim()) {
      await this.vm.addComment(this.commentText.trim(), this.commentType);
      this.commentText = '';
    }
  }
}
