import { Component, DestroyRef, inject, signal } from '@angular/core';
import { IUserAuth } from '../../auth/auth.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterLink } from '@angular/router';
import { TABLE_PAGINATION } from '../../shared/constants';
import { UserService } from '../../core/services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-users',
  imports: [NgxPaginationModule, RouterLink],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

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
}
