import { Component, inject, input, OnInit, signal } from '@angular/core';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { IAlert } from '../../../shared/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-alert-details',
  imports: [DatePipe],
  templateUrl: './alert-details.component.html',
  styleUrl: './alert-details.component.scss',
})
export class AlertDetailsComponent implements OnInit {
  private firestore = inject(Firestore);

  id = input.required<string>();
  alertSig = signal<IAlert | null>(null);

  async ngOnInit() {
    const snap = await getDoc(doc(this.firestore, `alerts/${this.id()}`));
    this.alertSig.set({ ...snap.data(), id: snap.id } as IAlert);
  }
}
