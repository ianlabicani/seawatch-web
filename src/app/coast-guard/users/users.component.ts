import { Component, DestroyRef, inject, signal } from '@angular/core';
import { IUserAuth } from '../../auth/auth.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterLink } from '@angular/router';
import { TABLE_PAGINATION } from '../../shared/constants';
import { UserService } from '../../core/services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ExportPdfService } from '../../core/services/export-pdf.service';

@Component({
  selector: 'app-users',
  imports: [NgxPaginationModule, RouterLink, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private exportPdfService = inject(ExportPdfService);

  exportForm = this.fb.nonNullable.group({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  exportError = signal<string | null>(null);

  usersSignal = signal<IUserAuth[]>([]);
  isLoading = signal<boolean>(true);
  itemsPerPage = TABLE_PAGINATION.ITEMS_PER_PAGE;
  currentPage = TABLE_PAGINATION.PAGE;

  ngOnInit(): void {
    this.userService
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((users) => {
        this.isLoading.set(false);
        this.usersSignal.set(users);
      });
  }

  async exportToPDF() {
    const { start, end } = this.exportForm.getRawValue();

    if (!start || !end) {
      this.exportError.set('Start and end dates are required.');
      return;
    }

    const columns: (keyof IUserAuth)[] = [
      'username',
      'email',
      'address',
      'firstname',
      'lastname',
      'phoneNumber',
      'role',
      'createdAt',
      'updatedAt',
    ];

    try {
      await this.exportPdfService.exportToPDF(
        'users',
        new Date(start),
        new Date(end),
        columns,
        'createdAt',
        (u: IUserAuth) => [
          u.username || 'No Name',
          u.email || 'No Email',
          u.address || 'No Address',
          u.firstname || 'No First Name',
          u.lastname || 'No Last Name',
          u.phoneNumber || 'No Phone Number',
          u.role || 'No Role',
          u.createdAt.toDate().toLocaleString(),
          u.updatedAt.toDate().toLocaleString(),
        ]
      );
    } catch (error: any) {
      this.exportError.set(error.message);
    }
  }
}
