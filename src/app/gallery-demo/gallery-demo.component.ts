// gallery-demo.component.ts
// ─────────────────────────────────────────────────────────────────────────────
// Demo version of the gallery with high-quality, relevant images from Pexels
// (free to use). Purpose: show the client how much better the page looks with
// good photography before the real WP images are production-ready.
//
// Route: /gallery-demo
// ─────────────────────────────────────────────────────────────────────────────
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { SliderComponent } from '../slider/slider.component';
import { PageShellComponent } from '../page-shell/page-shell.component';
import { MediaItem } from '../services/wordpress.service.service';
import { GalleryCategory } from '../gallery/gallery.component';

// ─── Helper: build a MediaItem from any public image URL ─────────────────────
function img(
  id: number,
  url: string,         // high-res  (1200–1600px wide)
  thumb: string,       // medium thumbnail (600–800px wide)
  alt: string,
  caption = ''
): MediaItem {
  return {
    id,
    title: alt,
    alt_text: alt,
    caption: caption || alt,
    description: '',
    media_type: 'image',
    mime_type: 'image/jpeg',
    source_url: url,
    sizes: {
      full:      { source_url: url,   width: 1600, height: 1067 },
      large:     { source_url: url,   width: 1200, height: 800  },
      medium:    { source_url: thumb, width: 800,  height: 533  },
      thumbnail: { source_url: thumb, width: 400,  height: 267  }
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE SETS  — Pexels free images, carefully matched to each marquee category
// ─────────────────────────────────────────────────────────────────────────────

const CLEARSPAN: MediaItem[] = [
  img(1, 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1400',
         'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800',
         'Large white event tent exterior', 'Clearspan marquee at a prestigious outdoor estate'),
  img(2, 'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=1400',
         'https://images.pexels.com/photos/169193/pexels-photo-169193.jpeg?auto=compress&cs=tinysrgb&w=800',
         'Wedding reception inside a marquee', 'Elegant wedding reception inside clearspan structure'),
  img(3, 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1400',
         'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
         'Outdoor event tent with guests', 'Corporate event inside a clearspan marquee'),
  img(4, 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=1400',
         'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=800',
         'Banquet tables inside large marquee', 'Banquet layout inside 12m clearspan'),
  img(5, 'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=1400',
         'https://images.pexels.com/photos/2306281/pexels-photo-2306281.jpeg?auto=compress&cs=tinysrgb&w=800',
         'Tent wedding reception at sunset', 'Clearspan marquee at golden hour'),
  img(6, 'https://images.pexels.com/photos/1729799/pexels-photo-1729799.jpeg?auto=compress&cs=tinysrgb&w=1400',
         'https://images.pexels.com/photos/1729799/pexels-photo-1729799.jpeg?auto=compress&cs=tinysrgb&w=800',
         'White marquee in garden setting', 'Clearspan marquee in formal garden'),
];

const STRETCH_TENTS: MediaItem[] = [
  img(10, 'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Stretch canopy tent at outdoor festival', 'Stretch tent canopy at summer festival'),
  img(11, 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Festival tent with coloured lighting', 'Stretch tent with festoon lighting at dusk'),
  img(12, 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Outdoor canopy party setup', 'Stretch tent covering outdoor party area'),
  img(13, 'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Tent structure at outdoor event', 'Stretch tent at garden party'),
];

const PAGODAS: MediaItem[] = [
  img(20, 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Elegant outdoor wedding tent', 'Pagoda marquee at country house wedding'),
  img(21, 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Wedding marquee with floral arch', 'Pagoda with full floral entrance styling'),
  img(22, 'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Reception tent with fairy lights', 'Pagoda interior with fairy light canopy'),
  img(23, 'https://images.pexels.com/photos/1047349/pexels-photo-1047349.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1047349/pexels-photo-1047349.jpeg?auto=compress&cs=tinysrgb&w=800',
          'White peak-roof marquee exterior', 'Classic pagoda marquee exterior view'),
  img(24, 'https://images.pexels.com/photos/2788494/pexels-photo-2788494.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/2788494/pexels-photo-2788494.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Evening wedding tent with candles', 'Pagoda marquee evening reception'),
];

const STARSHADES: MediaItem[] = [
  img(30, 'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Star-shaped canopy tent at event', 'Star shade marquee at outdoor exhibition'),
  img(31, 'https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Large outdoor canopy structure', 'Star shade covering large outdoor area'),
  img(32, 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Event tent at outdoor venue', 'Star shade at outdoor hospitality event'),
  img(33, 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Concert canopy tent with crowd', 'Twin star shade at concert event'),
];

const GAZEBOS: MediaItem[] = [
  img(40, 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Small white gazebo in garden', 'Gazebo marquee in private garden setting'),
  img(41, 'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1128318/pexels-photo-1128318.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Garden party tent setup', 'Gazebo at summer garden party'),
  img(42, 'https://images.pexels.com/photos/1306791/pexels-photo-1306791.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1306791/pexels-photo-1306791.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Pop-up gazebo market stall', 'Gazebo marquees as market stalls'),
  img(43, 'https://images.pexels.com/photos/587960/pexels-photo-587960.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/587960/pexels-photo-587960.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Outdoor party gazebo with lights', 'Gazebo with decorative lighting at party'),
];

const CINEMA: MediaItem[] = [
  img(50, 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Outdoor cinema screen at night', 'Outdoor cinema screening under marquee'),
  img(51, 'https://images.pexels.com/photos/3709369/pexels-photo-3709369.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/3709369/pexels-photo-3709369.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Deck chairs at outdoor film screening', 'Deck chairs laid out for private screening'),
  img(52, 'https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=800',
          'Cinema experience with popcorn', 'Cinema marquee — the full experience'),
  img(53, 'https://images.pexels.com/photos/274937/pexels-photo-274937.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/274937/pexels-photo-274937.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Large projection screen setup', 'Professional projection inside cinema marquee'),
  img(54, 'https://images.pexels.com/photos/1572386/pexels-photo-1572386.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1572386/pexels-photo-1572386.jpeg?auto=compress&cs=tinysrgb&w=800',
          'People watching outdoor film', 'Guests enjoying cinema marquee screening'),
];

const INTERIORS: MediaItem[] = [
  img(60, 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Marquee interior with chandeliers and dining', 'White-draped interior with chandelier lighting'),
  img(61, 'https://images.pexels.com/photos/265920/pexels-photo-265920.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/265920/pexels-photo-265920.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Elegant event interior with round tables', 'Fine dining round table layout inside marquee'),
  img(62, 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Wedding interior with fairy lights', 'Fairy light canopy inside lined marquee'),
  img(63, 'https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Candle-lit dinner inside event tent', 'Intimate candlelit dinner inside marquee'),
  img(64, 'https://images.pexels.com/photos/2291367/pexels-photo-2291367.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/2291367/pexels-photo-2291367.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Banquet with floral centrepieces', 'Full banquet with floral centrepiece styling'),
  img(65, 'https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1395964/pexels-photo-1395964.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Gold mood lighting inside tent', 'Gold mood lighting creating warm atmosphere'),
];

const FLOORING: MediaItem[] = [
  img(70, 'https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Parquet dance floor at wedding reception', 'Polished parquet dance floor inside marquee'),
  img(71, 'https://images.pexels.com/photos/1709003/pexels-photo-1709003.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1709003/pexels-photo-1709003.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Wooden floor inside event space', 'Interlocking wooden flooring on steel subframe'),
  img(72, 'https://images.pexels.com/photos/1571442/pexels-photo-1571442.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/1571442/pexels-photo-1571442.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Event floor with seating area', 'Level flooring across uneven garden terrain'),
  img(73, 'https://images.pexels.com/photos/2240763/pexels-photo-2240763.jpeg?auto=compress&cs=tinysrgb&w=1400',
          'https://images.pexels.com/photos/2240763/pexels-photo-2240763.jpeg?auto=compress&cs=tinysrgb&w=800',
          'Dance floor with LED lighting', 'LED dance floor option for weddings and parties'),
];

// ── Category definitions with images and cover images baked in ───────────────
const DEMO_CATEGORIES_2= [
  {
    id: 'clearspan', label: 'Clearspan',
    icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z',
    highlight: 'Our most popular structure',
    description: 'Clearspan marquees are our most versatile structure — no internal poles means a completely open, unobstructed floor plan. Perfect for weddings, corporate events and large gatherings. Available in widths from 6m to 15m and any length, they can be linked together to create bespoke event spaces.',
    coverImage: CLEARSPAN[0].source_url,
    images: CLEARSPAN
  },
  {
    id: 'stretch-tents', label: 'Stretch Tents',
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    highlight: 'Unique organic shapes',
    description: 'Stretch tents offer a modern, fluid aesthetic that adapts to any environment. Their tensioned fabric creates stunning organic canopy shapes that work beautifully for festivals, garden parties and contemporary events. UV-resistant, waterproof and available in a range of colours.',
    coverImage: STRETCH_TENTS[0].source_url,
    images: STRETCH_TENTS
  },
  {
    id: 'pagodas', label: 'Pagodas',
    icon: 'M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11M8 10v11M16 10v11M12 10v11',
    highlight: 'Classic elegance',
    description: 'Pagoda marquees bring timeless elegance to any outdoor event. Their distinctive peaked roofline and windowed sides create a stunning visual impression. They can be linked to clearspan marquees to create entrance porticos, bar areas or additional reception space.',
    coverImage: PAGODAS[0].source_url,
    images: PAGODAS
  },
  {
    id: 'starshades', label: 'Starshades',
    icon: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83',
    highlight: 'Striking star-shaped canopy',
    description: 'Starshade marquees make an immediate visual statement at any event. Their distinctive star-shaped canopy roof provides excellent weather protection while creating a unique atmosphere. Available as single or twin configurations, ideal for exhibitions and prestigious outdoor functions.',
    coverImage: STARSHADES[0].source_url,
    images: STARSHADES
  },
  {
    id: 'gazebos', label: 'Gazebos',
    icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',
    highlight: 'Modular & flexible',
    description: 'Our modular gazebo marquees are perfect for smaller events, market stalls and garden parties. They can be joined in various orientations — side by side, back to back or in an L-shape — making them ideal for fitting unusual spaces. Quick to erect and easy to personalise.',
    coverImage: GAZEBOS[0].source_url,
    images: GAZEBOS
  },
  {
    id: 'cinema', label: 'Cinema',
    icon: 'M15 10l4.553-2.069A1 1 0 0121 8.87V15.13a1 1 0 01-1.447.9L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z',
    highlight: 'Unique cinema experiences',
    description: 'Transform any outdoor space into a spectacular cinema experience. Our cinema marquees are blacked-out structures fitted with professional projection and sound equipment. Perfect for private screenings, corporate entertainment and public events. We supply everything — you provide the popcorn.',
    coverImage: CINEMA[0].source_url,
    images: CINEMA
  },
  {
    id: 'interiors', label: 'Interiors',
    icon: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm7 4v10M3 12h18',
    highlight: 'Beautiful interior styling',
    description: 'The interior is where your event vision truly comes to life. We offer full silk ceiling linings, mood lighting in any colour, chandelier drops, fairy light canopies, and a variety of flooring options. Our team will help you design an interior that perfectly matches your theme and atmosphere.',
    coverImage: INTERIORS[0].source_url,
    images: INTERIORS
  },
  {
    id: 'flooring', label: 'Flooring',
    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    highlight: 'Level, solid underfoot',
    description: 'A quality floor transforms the comfort and appearance of any marquee event. We offer interlocking wooden parquet on galvanised steel subframes — ideal for uneven ground — as well as plastic interlocking tiles. Dance floors in polished hardwood or LED options are also available.',
    coverImage: FLOORING[0].source_url,
    images: FLOORING
  }
];

@Component({
  selector: 'app-gallery-demo',
  standalone: true,
  imports: [CommonModule, RouterLink, PageShellComponent, SliderComponent],
  templateUrl: './gallery-demo.component.html',
  styleUrl: './gallery-demo.component.scss'
})
export class GalleryDemoComponent implements OnInit, OnDestroy {

  readonly categories: GalleryCategory[] = [];
  activeId = 'clearspan';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meta: Meta,
    private titleService: Title
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle("Marquee Gallery (Demo) | Baillie's Marquees");
    this.meta.updateTag({
      name: 'robots', content: 'noindex'   // keep demo out of search engines
    });

    this.route.fragment
      .pipe(takeUntil(this.destroy$))
      .subscribe(fragment => {
        if (fragment && this.categories.find(c => c.id === fragment)) {
          this.activeId = fragment;
        }
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get activeCategory(): GalleryCategory | undefined {
    return this.categories.find(c => c.id === this.activeId);
  }

  selectCategory(id: string): void {
    this.activeId = id;
    this.router.navigate([], { fragment: id, replaceUrl: true });
  }
}
