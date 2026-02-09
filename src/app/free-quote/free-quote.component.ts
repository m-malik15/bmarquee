// free-quote.component.ts
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml, Meta, Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { WordPressService2, WordPressPage } from '../services/wordpress.service.service';

interface QuoteFormData {
  // Event Details
  eventStreetAddress: string;
  eventCityTown: string;
  eventPostcode: string;
  additionalInformation: string;
  eventType: string;
  otherEventType: string;
  groundType: string;
  totalGuests: number | null;
  eventStartDate: string;
  startTime: string;
  eventEndDate: string;
  endTime: string;

  // Marquee Add-On's & Extras
  accessories: string[];

  // Your Details
  bookingType: string;
  companyName: string;
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  billingStreetAddress: string;
  billingCityTown: string;
  billingPostcode: string;
  privacyAgreed: boolean;
}

@Component({
  selector: 'app-free-quote',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './free-quote.component.html',
  styleUrl: './free-quote.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate('600ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class FreeQuoteComponent implements OnInit, OnDestroy {
  quoteForm!: FormGroup;
  isLoading = true;
  isSubmitting = false;
  submitSuccess = false;
  submitError: string | null = null;
  error: string | null = null;
  page: WordPressPage | null = null;

  // Form options
  eventTypes = [
    'Wedding',
    'Birthday',
    'Anniversary',
    'Family gathering',
    'Corporate event',
    'Market stall',
    'Leisure event',
    'Public event',
    'Other. Please specify'
  ];

  groundTypes = [
    'Hard standing e.g tarmac or concrete (cannot be pegged)',
    'Soft ground can be pegged',
    'Unsure'
  ];

  // Simplified accessories options
  accessoryOptions = [
    'Interior Linings',
    'Flooring',
    'Lighting',
    'Heating',
    'Furniture'
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private wpService: WordPressService2,
    private sanitizer: DomSanitizer,
    private meta: Meta,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.setupFormListeners();
    this.setMetaTags();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Simulate loading (remove this if you're actually loading WordPress data)
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.quoteForm = this.fb.group({
      // Event Details
      eventStreetAddress: ['', Validators.required],
      eventCityTown: ['', Validators.required],
      eventPostcode: ['', Validators.required],
      additionalInformation: [''],
      eventType: ['', Validators.required],
      otherEventType: [''],
      groundType: ['', Validators.required],
      totalGuests: [null], // Single guest field
      eventStartDate: ['', Validators.required],
      startTime: [''],
      eventEndDate: ['', Validators.required],
      endTime: [''],

      // Simplified Accessories (single array for checkboxes)
      accessories: [[]],

      // Your Details
      bookingType: [''],
      companyName: [''],
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      billingStreetAddress: [''],
      billingCityTown: [''],
      billingPostcode: [''],
      privacyAgreed: [false, Validators.requiredTrue]
    });
  }

  private setupFormListeners() {
    // Show/hide "Other event type" field
    this.quoteForm.get('eventType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        const otherEventTypeControl = this.quoteForm.get('otherEventType');
        if (value === 'Other. Please specify') {
          otherEventTypeControl?.setValidators([Validators.required]);
        } else {
          otherEventTypeControl?.clearValidators();
          otherEventTypeControl?.setValue('');
        }
        otherEventTypeControl?.updateValueAndValidity();
      });

    // Show/hide "Company name" field
    this.quoteForm.get('bookingType')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        const companyNameControl = this.quoteForm.get('companyName');
        if (value === 'Company') {
          companyNameControl?.setValidators([Validators.required]);
        } else {
          companyNameControl?.clearValidators();
          companyNameControl?.setValue('');
        }
        companyNameControl?.updateValueAndValidity();
      });
  }

  onCheckboxChange(event: Event, controlName: string) {
    const checkbox = event.target as HTMLInputElement;
    const currentValue: string[] = this.quoteForm.get(controlName)?.value || [];

    if (checkbox.checked) {
      // Add the checked item
      const newValue = [...currentValue, checkbox.value];

      // If Interior Linings is selected, automatically add Flooring
      if (checkbox.value === 'Interior Linings' && !newValue.includes('Flooring')) {
        newValue.push('Flooring');
      }

      this.quoteForm.patchValue({
        [controlName]: newValue
      });
    } else {
      // Don't allow unchecking Flooring if Interior Linings is selected
      if (checkbox.value === 'Flooring' && currentValue.includes('Interior Linings')) {
        // Prevent unchecking by re-checking the checkbox
        checkbox.checked = true;
        return;
      }

      this.quoteForm.patchValue({
        [controlName]: currentValue.filter(item => item !== checkbox.value)
      });
    }
  }

  onSubmit() {
    if (this.quoteForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.quoteForm.controls).forEach(key => {
        this.quoteForm.get(key)?.markAsTouched();
      });

      // Scroll to first error
      const firstError = document.querySelector('.form-group.error, .error-message');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    const formData = this.quoteForm.value;

    // TODO: Replace this with your actual API call
    console.log('Form submitted:', formData);

    // Simulate API call
    setTimeout(() => {
      // Success scenario
      this.isSubmitting = false;
      this.submitSuccess = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Reset form after success
      this.quoteForm.reset();

      // Or error scenario (uncomment to test)
      // this.isSubmitting = false;
      // this.submitError = 'There was a problem submitting your quote request. Please try again.';
    }, 2000);
  }

  private setMetaTags() {
    this.titleService.setTitle('Free Quotation - Baillie\'s Marquees');
    this.meta.updateTag({
      name: 'description',
      content: 'Get a free quote for your marquee hire. Professional event planning assistance with detailed pricing.'
    });
    this.meta.updateTag({ property: 'og:title', content: 'Free Quotation - Baillie\'s Marquees' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Get a free quote for your marquee hire. Professional event planning assistance with detailed pricing.'
    });
  }

  isFlooringDisabled(): boolean {
    const accessories = this.quoteForm.get('accessories')?.value || [];
    return accessories.includes('Interior Linings');
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.quoteForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.quoteForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }
}
