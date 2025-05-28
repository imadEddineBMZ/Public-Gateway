# DonorConnect - Blood Donation Platform

A modern blood donation platform built with Next.js 15, React 19, and Bun.

## 🚀 Getting Started with Bun

### Prerequisites

- [Bun](https://bun.sh/) (latest version)
- Node.js 18+ (for Next.js compatibility)

### Installation

1. Clone the repository:
\`\`\`bash
git clone <your-repo-url>
cd donor-connect
\`\`\`

2. Install dependencies with Bun:
\`\`\`bash
bun install
\`\`\`

3. Run the development server:
\`\`\`bash
bun dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server
- `bun lint` - Run ESLint
- `bun type-check` - Run TypeScript type checking

## 🛠️ Tech Stack

- **Runtime**: Bun
- **Framework**: Next.js 15 (App Router)
- **React**: React 19
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 🏗️ Project Structure

\`\`\`
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions
├── public/               # Static assets
└── types/                # TypeScript type definitions
\`\`\`

## 🎨 Features

- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Authentication**: User registration and login system
- **Dashboard**: Comprehensive donor dashboard
- **Real-time**: Blood request notifications
- **Mobile-first**: Responsive design for all devices
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized for speed with Bun and Next.js 15

## 🔧 Development

### Adding New Dependencies

\`\`\`bash
bun add <package-name>
bun add -d <dev-package-name>
\`\`\`

### Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Add your environment variables here
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### Code Quality

The project includes:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting (recommended)

## 🚀 Deployment

### Build for Production

\`\`\`bash
bun run build
\`\`\`

### Start Production Server

\`\`\`bash
bun start
\`\`\`

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
