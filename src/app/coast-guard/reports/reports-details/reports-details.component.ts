import { Component, inject, input, OnInit, signal } from '@angular/core';
import { IReport } from '../../../shared/models';
import { getDoc, doc, Firestore } from '@angular/fire/firestore';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-reports-details',
  imports: [DatePipe],
  templateUrl: './reports-details.component.html',
  styleUrl: './reports-details.component.scss',
})
export class ReportsDetailsComponent {
  reportSig = input.required<IReport>();
}
