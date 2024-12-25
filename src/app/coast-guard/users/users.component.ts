import { Component, inject, signal } from '@angular/core';
import { IUserAuth } from '../../auth/auth.service';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { map } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';
import { RouterLink } from '@angular/router';
import { TABLE_PAGINATION } from '../../shared/constants';

@Component({
  selector: 'app-users',
  imports: [NgxPaginationModule, RouterLink],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent {
  private firestore = inject(Firestore);
  usersSignal = signal<IUserAuth[]>([]);

  itemsPerPage = TABLE_PAGINATION.ITEMS_PER_PAGE;
  currentPage = TABLE_PAGINATION.PAGE;

  ngOnInit(): void {
    collectionData(collection(this.firestore, 'users'), {
      idField: 'id',
    })
      .pipe(map((u) => u as IUserAuth[]))
      .subscribe((users) => {
        this.usersSignal.set(users);
      });
  }
}
