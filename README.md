# Berlin Schools Map

An interactive map application for exploring all schools in Berlin with detailed statistics, construction projects, and travel time estimates. Built to help parents find the right school for their children by aggregating data from official Berlin government sources.

## Features

- 🗺️ **Interactive Map**: Explore all schools in Berlin on a Leaflet-based map
- 📊 **Detailed Statistics**: View student counts, teacher ratios, and demographic data
- 🏗️ **Construction Projects**: Track ongoing and planned school construction
- 🚶 **Travel Time Estimates**: Calculate walking and transit times to schools
- 🏷️ **Custom Tags**: Mark and filter schools by custom criteria
- 🌓 **Dark Mode**: Beautiful dark theme by default
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices
- ♿ **Accessible**: Built with accessibility in mind

## Technologies Used

- [Next.js 15](https://nextjs.org/) - React framework with App Router
- [HeroUI](https://heroui.com/) - Modern UI component library
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe development
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Backend API running (see [school-go](https://github.com/amelnik/school-go))

### Installation

1. Clone the repository:

```bash
git clone https://github.com/amelnik/schools-info.git
cd schools-info
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (optional):

```bash
# Create .env.local file
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Data Sources

All data is sourced from official Berlin government databases:

- **School Locations**: Berlin Geodata Infrastructure (GDI)
- **Student & Teacher Statistics**: Berlin Open Data portal
- **Construction Projects**: Berlin Open Data - School Construction Map
- **Schools After 4th Grade**: Berlin Education Authority

See the [About page](/about) for detailed source information.

## SEO Optimization

This application is optimized for search engines with:

- ✅ Comprehensive meta tags (Open Graph, Twitter Cards)
- ✅ Structured data (JSON-LD) for rich search results
- ✅ Dynamic sitemap and robots.txt
- ✅ Proper canonical URLs
- ✅ SEO-friendly descriptions and keywords
- ✅ PWA manifest for installability

For details, see [SEO_IMPROVEMENTS.md](./SEO_IMPROVEMENTS.md)

## Project Structure

```
schools-info/
├── app/                  # Next.js App Router pages
│   ├── about/           # About page
│   ├── layout.tsx       # Root layout with metadata
│   ├── page.tsx         # Home page (map view)
│   ├── robots.ts        # Dynamic robots.txt
│   └── sitemap.ts       # Dynamic sitemap
├── components/          # React components
│   ├── schools-map/    # Map-related components
│   └── structured-data.tsx  # SEO structured data
├── config/             # Configuration files
│   └── site.ts         # Site metadata and config
├── lib/                # Utilities and business logic
│   ├── actions/        # Server actions
│   ├── api/            # API client
│   └── store/          # Zustand stores
└── public/             # Static assets
```

## Development

### Building for Production

```bash
npm run build
```

### Running Production Build

```bash
npm start
```

### Linting

```bash
npm run lint
```

## Related Projects

- [school-go](https://github.com/amelnik/school-go) - Backend API service for school data

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Licensed under the [MIT license](./LICENSE).

## Author

Built with ❤️ by [Alex Melnik](https://github.com/amelnik) - A Berlin-based software engineer and dad making school search easier for families.
