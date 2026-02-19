import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent implements OnInit {

  constructor(
    private meta: Meta,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Contact Us | Baillie's Marquees");
    this.meta.updateTag({
      name: 'description',
      content: "Contact Baillie's Marquees by phone or email. For marquee hire quotes, please use our free quotation form."
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
