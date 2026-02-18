import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

export interface ServiceArea {
  id: string;
  name: string;
  exclusion?: string;
}

@Component({
  selector: 'app-service-areas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-areas.component.html',
  styleUrl: './service-areas.component.scss'
})
export class ServiceAreasComponent implements OnInit {

  // Set this to your WordPress media URL for the map image
  // e.g. mapImageUrl = 'https://www.bailliesmarquees.co.uk/wp-content/uploads/scotland-map.png';
  mapImageUrl = 'assets/images/areas-map.png';

  fullCoverageAreas: ServiceArea[] = [
    { id: 'ayrshire',         name: 'Ayrshire' },
    { id: 'clackmannanshire', name: 'Clackmannanshire' },
    { id: 'edinburgh',        name: 'Edinburgh' },
    { id: 'fife',             name: 'Fife' },
    { id: 'glasgow',          name: 'Glasgow' },
    { id: 'lanarkshire',      name: 'North & South Lanarkshire' },
  ];

  partialCoverageAreas: ServiceArea[] = [
    { id: 'dumfries',    name: 'Dumfries & Galloway', exclusion: 'DG4 to DG9, DG13 and DG14' },
    { id: 'renfrewshire',name: 'Renfrewshire',         exclusion: 'Islands' },
    { id: 'perthshire',  name: 'Perthshire',           exclusion: 'PH19 – PH50' },
  ];

  constructor(
    private meta: Meta,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Service Areas | Baillie's Marquees");
    this.meta.updateTag({
      name: 'description',
      content: "Baillie's Marquees covers central Scotland including Glasgow, Edinburgh, Fife, Ayrshire and more. Check our service areas for marquee hire."
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
