# Quiz Arena Campus LMS

A modern, interactive Learning Management System (LMS) platform designed for educational institutions to create, manage, and conduct quizzes effectively.

🌐 **Live Demo**: [https://quiz-arena-campus-lms.vercel.app](https://quiz-arena-campus-lms.vercel.app)

## 🎯 Features

- **Quiz Management**: Create and manage quizzes with comprehensive question types
- **Interactive Assessments**: Real-time quiz taking with immediate feedback
- **Analytics & Insights**: Detailed performance analytics and progress tracking
- **Beautiful UI**: Modern, responsive design built with shadcn/ui and Tailwind CSS
- **Real-time Collaboration**: WebRTC-powered video conferencing support
- **Cloud Storage**: Secure file storage with Supabase integration
- **AI-Powered Features**: Google Generative AI integration for smart content generation
- **Data Visualization**: Advanced charts and graphs using Nivo and Recharts
- **Theme Support**: Dark and light mode support with next-themes

## 🛠️ Technology Stack

- **Frontend Framework**: React 18.3
- **Build Tool**: Vite 5.4
- **Language**: TypeScript & JavaScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Real-time Communication**: Zego Express (WebRTC)
- **API Calls**: Axios
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Nivo, Recharts, D3
- **Icons**: Tabler Icons, Lucide React
- **Animations**: Framer Motion

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Mahir123456789123/quiz-arena-campus-lms.git
cd quiz-arena-campus-lms
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env.local` file in the root directory and add your credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
VITE_ZEGO_APP_ID=your_zego_app_id
VITE_ZEGO_SERVER_SECRET=your_zego_server_secret
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📚 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## 📂 Project Structure

```
quiz-arena-campus-lms/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── lib/            # Utility functions and helpers
│   ├── hooks/          # Custom React hooks
│   └── App.tsx         # Main application component
├── public/             # Static assets
├── package.json        # Dependencies and scripts
├── tailwind.config.js  # Tailwind CSS configuration
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript configuration
```

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel settings
4. Deploy with one click

### Deploy to Other Platforms

The project can be built and deployed to any Node.js-compatible platform:

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## 🔐 Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `VITE_GOOGLE_AI_API_KEY` | Google Generative AI API key |
| `VITE_ZEGO_APP_ID` | Zego Express Engine app ID |
| `VITE_ZEGO_SERVER_SECRET` | Zego Express Engine server secret |

## 🎨 UI Components

This project uses **shadcn/ui** for a collection of beautifully designed, accessible components including:

- Forms and inputs
- Dialogs and modals
- Dropdown menus
- Tabs and accordions
- Progress indicators
- And many more...

Learn more at [shadcn/ui Documentation](https://ui.shadcn.com)

## 📊 Data Visualization

- **Nivo Charts**: Professional bar, line, pie, heatmap, and radar charts
- **Recharts**: Responsive, composable charting library
- **D3 Utilities**: Advanced data transformations and scales

## 🔄 Real-time Features

- **Supabase Real-time**: Live updates for quiz data and submissions
- **Zego WebRTC**: Video and audio communication for virtual classrooms
- **React Query**: Efficient server state management with caching

## 🧪 Testing & Quality

- **ESLint**: Code quality and style consistency
- **TypeScript**: Type safety for better code reliability

## 📖 Documentation

For more information about the technologies used:

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com/docs)
- [Google Generative AI](https://ai.google.dev)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Mahir123456789123**

- GitHub: [@Mahir123456789123](https://github.com/Mahir123456789123)
- Project: [Quiz Arena Campus LMS](https://github.com/Mahir123456789123/quiz-arena-campus-lms)

## 🙋 Support

If you encounter any issues or have questions, please open an [issue](https://github.com/Mahir123456789123/quiz-arena-campus-lms/issues) on GitHub.

---

**Made with ❤️ for educators and students**
