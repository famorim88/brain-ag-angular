import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProducerService } from '../services/producer.service';
import { ProducerCreate, ProducerResponse, ProducerUpdate, CultureCreate, CultureResponse } from '../models/producer.model';
import { forkJoin, Observable } from 'rxjs'; // Import forkJoin for parallel async calls

@Component({
  selector: 'app-producer-form',
  templateUrl: './producer-form.component.html',
  styleUrls: ['./producer-form.component.scss']
})
export class ProducerFormComponent implements OnInit {
  producerForm!: FormGroup;
  cultureForm!: FormGroup;
  isEditMode: boolean = false;
  producerId: number | null = null;
  loading: boolean = false;
  submitError: string | null = null;
  culturesToDelete: number[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private producerService: ProducerService
  ) { }

  ngOnInit(): void {
    this.producerForm = this.fb.group({
      cpf_cnpj: ['', [Validators.required, this.cpfCnpjValidator]],
      name: ['', Validators.required],
      farm_name: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      total_area: [0, [Validators.required, Validators.min(0.01)]],
      agricultural_area: [0, [Validators.required, Validators.min(0)]],
      vegetation_area: [0, [Validators.required, Validators.min(0)]],
      cultures: this.fb.array([]) // FormArray for cultures
    }, { validators: this.areaSumValidator }); // Add custom validator at form group level

    this.cultureForm = this.fb.group({
      crop_year: ['', Validators.required],
      name: ['', Validators.required]
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.producerId = +id; // Convert string to number
        this.loadProducerData(this.producerId);
        // Disable cpf_cnpj in edit mode
        this.producerForm.get('cpf_cnpj')?.disable();
      } else {
        this.isEditMode = false;
        // Enable cpf_cnpj for new producer
        this.producerForm.get('cpf_cnpj')?.enable();
      }
    });
  }

  // --- FormArray Getters ---
  get cultures(): FormArray {
    return this.producerForm.get('cultures') as FormArray;
  }

  // --- Custom Validators ---
  cpfCnpjValidator(control: any): { [key: string]: any } | null {
    const value = control.value ? control.value.replace(/\D/g, '') : '';
    if (!value) {
      return null; // Let Validators.required handle empty string
    }
    return (value.length === 11 || value.length === 14) ? null : { 'invalidCpfCnpj': true };
  }

  areaSumValidator(group: FormGroup): { [key: string]: any } | null {
    const totalArea = group.get('total_area')?.value || 0;
    const agriculturalArea = group.get('agricultural_area')?.value || 0;
    const vegetationArea = group.get('vegetation_area')?.value || 0;

    if (agriculturalArea + vegetationArea > totalArea) {
      return { 'areaSumExceedsTotal': true };
    }
    return null;
  }

  // --- Load Data for Edit Mode ---
  loadProducerData(id: number): void {
    this.loading = true;
    this.producerService.getProducerById(id).subscribe({
      next: (producer) => {
        // Patch the main form values
        this.producerForm.patchValue({
          name: producer.name,
          farm_name: producer.farm_name,
          city: producer.city,
          state: producer.state,
          total_area: producer.total_area,
          agricultural_area: producer.agricultural_area,
          vegetation_area: producer.vegetation_area
        });
        // Set CPF/CNPJ separately as it's disabled in edit mode
        this.producerForm.get('cpf_cnpj')?.setValue(producer.cpf_cnpj);

        // Clear existing cultures and add them from the loaded producer
        this.cultures.clear();
        producer.cultures.forEach(culture => {
          this.cultures.push(this.fb.group({
            id: [culture.id], // Keep the original ID for existing cultures
            producer_id: [culture.producer_id], // Keep the original producer_id
            crop_year: [culture.crop_year, Validators.required],
            name: [culture.name, Validators.required]
          }));
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading producer:', err);
        this.submitError = 'Failed to load producer data.';
        this.loading = false;
      }
    });
  }

  // --- Culture Management ---
  addCulture(): void {
    if (this.cultureForm.valid) {
      const newCultureData: CultureCreate = this.cultureForm.value;

      if (this.isEditMode && this.producerId) {
        // If in edit mode, add to backend immediately
        this.loading = true;
        this.producerService.addCultureToProducer(this.producerId, newCultureData).subscribe({
          next: (addedCultureResponse) => {
            alert('Cultura adicionada com sucesso!');
            this.cultures.push(this.fb.group({ // Add to form array with ID
              id: [addedCultureResponse.id],
              producer_id: [addedCultureResponse.producer_id],
              crop_year: [addedCultureResponse.crop_year, Validators.required],
              name: [addedCultureResponse.name, Validators.required]
            }));
            this.cultureForm.reset(); // Clear culture form
            this.loading = false;
          },
          error: (err) => {
            console.error('Error adding culture:', err);
            this.submitError = err.error?.detail || 'Failed to add culture.';
            this.loading = false;
          }
        });
      } else {
        // If creating new producer, add to local form array with a temporary ID
        this.cultures.push(this.fb.group({
          id: [Date.now()], // Temporary ID for new unsaved cultures
          crop_year: [newCultureData.crop_year, Validators.required],
          name: [newCultureData.name, Validators.required]
        }));
        this.cultureForm.reset(); // Clear culture form
      }
    } else {
      alert('Please fill in both crop year and culture name.');
      this.cultureForm.markAllAsTouched(); // Show validation errors
    }
  }

  removeCulture(index: number): void {
    const cultureControl = this.cultures.at(index);
    const cultureId = cultureControl.get('id')?.value;

    if (cultureId && this.isEditMode && this.producerId) {
      // If it's an existing culture from the backend, mark for deletion
      if (confirm(`Are you sure you want to remove the culture "${cultureControl.get('name')?.value}" (Crop Year: ${cultureControl.get('crop_year')?.value}) from this producer? This action is irreversible.`)) {
        this.culturesToDelete.push(cultureId);
        this.cultures.removeAt(index);
        alert('Cultura marcada para remoção. A remoção final ocorrerá ao salvar o produtor.');
        // Actual deletion will happen in onSubmit
      }
    } else {
      // If it's a newly added local culture, just remove from array
      if (confirm(`Are you sure you want to remove the culture "${cultureControl.get('name')?.value}" (Crop Year: ${cultureControl.get('crop_year')?.value}) from this list (not yet saved)?`)) {
        this.cultures.removeAt(index);
      }
    }
  }


  // --- Form Submission ---
  onSubmit(): void {
    this.submitError = null;
    this.producerForm.markAllAsTouched(); // Mark all fields as touched to show validation errors

    if (this.producerForm.invalid) {
      // Custom validation messages for sum area
      if (this.producerForm.errors?.['areaSumExceedsTotal']) {
        this.submitError = 'Sum of agricultural and vegetation area cannot exceed total area.';
      } else if (this.producerForm.get('cpf_cnpj')?.errors?.['invalidCpfCnpj'] && !this.isEditMode) {
        this.submitError = 'Invalid CPF/CNPJ.';
      } else {
        this.submitError = 'Please fill in all required fields correctly.';
      }
      return;
    }

    this.loading = true;

    // Create a temporary object with form data, excluding 'cultures' initially for update
    const producerData: ProducerCreate | ProducerUpdate = {
        ...this.producerForm.getRawValue() // Use getRawValue to get values from disabled fields
    };

    // Remove the `cultures` property as it's handled separately for updates
    delete producerData.cultures;


    // Step 1: Handle producer creation/update
    let producerObservable: Observable<ProducerResponse>;
    if (this.isEditMode && this.producerId) {
      producerObservable = this.producerService.updateProducer(this.producerId, producerData as ProducerUpdate);
    } else {
      // For new producer, cultures are sent initially.
      // Need to transform cultures FormArray into simple array for ProducerCreate
      const culturesToCreate: CultureCreate[] = this.cultures.controls.map(control => control.value);
      producerObservable = this.producerService.createProducer({ ...(producerData as ProducerCreate), cultures: culturesToCreate });
    }

    producerObservable.subscribe({
      next: (response) => {
        alert(this.isEditMode ? 'Producer updated successfully!' : 'Producer created successfully!');

        // Step 2 (for edit mode): Handle culture deletions
        let deleteCultureObservables: Observable<any>[] = [];
        if (this.isEditMode && this.producerId) {
          this.culturesToDelete.forEach(cultureId => {
            deleteCultureObservables.push(this.producerService.deleteCultureFromProducer(this.producerId!, cultureId));
          });
        }

        if (deleteCultureObservables.length > 0) {
          forkJoin(deleteCultureObservables).subscribe({
            next: () => {
              alert('Cultures removed successfully!');
              this.loading = false;
              this.router.navigate(['/producers']);
            },
            error: (err) => {
              console.error('Error deleting cultures:', err);
              this.submitError = 'Producer updated, but failed to delete some cultures.';
              this.loading = false;
              this.router.navigate(['/producers']); // Navigate anyway
            }
          });
        } else {
          this.loading = false;
          this.router.navigate(['/producers']);
        }
      },
      error: (err) => {
        console.error('Error submitting producer:', err);
        this.submitError = err.error?.detail || 'Failed to save producer. Please check your data.';
        this.loading = false;
      }
    });
  }
}