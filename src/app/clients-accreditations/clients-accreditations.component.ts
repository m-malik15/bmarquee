import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ClientLogo {
  src: string;
  alt: string;
}

export interface Accreditation {
  src: string;
  alt: string;
  title?: string;
}

export interface ClientsAccreditationsData {
  clientsTitle: string;
  clients: ClientLogo[];
  accreditationsTitle: string;
  accreditations: Accreditation[];
}

@Component({
  selector: 'app-clients-accreditations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clients-accreditations.component.html',
  styleUrl: './clients-accreditations.component.scss'
})
export class ClientsAccreditationsComponent {
  @Input() data: ClientsAccreditationsData | null = null;
}
