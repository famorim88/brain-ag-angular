import { Component, OnInit } from '@angular/core';
import { ProducerService } from '../services/producer.service';
import { ProducerResponse } from '../models/producer.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-producer-list',
  templateUrl: './producer-list.component.html',
  styleUrls: ['./producer-list.component.scss']
})
export class ProducerListComponent implements OnInit {
  producers: ProducerResponse[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private producerService: ProducerService, private router: Router) { }

  ngOnInit(): void {
    this.fetchProducers();
  }

  fetchProducers(): void {
    this.loading = true;
    this.error = null;
    this.producerService.getProducers().subscribe({
      next: (data) => {
        this.producers = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching producers:', err);
        this.error = 'Failed to load producers. Please try again.';
        this.loading = false;
      }
    });
  }

  editProducer(id: number): void {
    this.router.navigate(['/producers/edit', id]);
  }

  deleteProducer(id: number): void {
    if (confirm('Are you sure you want to delete this producer?')) {
      this.producerService.deleteProducer(id).subscribe({
        next: () => {
          alert('Producer deleted successfully!');
          this.fetchProducers(); // Refresh the list
        },
        error: (err) => {
          console.error('Error deleting producer:', err);
          this.error = 'Failed to delete producer. Please try again.';
        }
      });
    }
  }

  goToNewProducer(): void {
    this.router.navigate(['/producers/new']);
  }
}