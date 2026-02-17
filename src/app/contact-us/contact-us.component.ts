import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private meta: Meta,
    private titleService: Title
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle("Contact Us | Baillie's Marquees");
    this.meta.updateTag({
      name: 'description',
      content: "Get in touch with Baillie's Marquees. Phone us or send a quick message. For quotations please use our free quote form."
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      const firstError = document.querySelector('.form-group.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    // TODO: Replace with actual API/email service call
    console.log('Contact form submitted:', this.contactForm.value);

    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      this.contactForm.reset();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  }

  isInvalid(field: string): boolean {
    const control = this.contactForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  resetForm(): void {
    this.submitSuccess = false;
    this.submitError = null;
    this.contactForm.reset();
  }
}
