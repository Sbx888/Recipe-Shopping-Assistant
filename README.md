# AI Recipe Extractor

An intelligent recipe parsing application that extracts ingredients from recipe URLs and prepares shopping lists (with future supermarket product matching).

## Features

- Recipe URL parsing and ingredient extraction
- Servings adjustment functionality
- Intelligent ingredient parsing using OpenAI
- Modern Vue.js frontend with TypeScript
- RESTful Node.js/Express backend
- MongoDB database integration

## Tech Stack

### Frontend
- Vue.js with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Axios for HTTP requests
- Pinia for state management

### Backend
- Node.js with Express
- MongoDB with Mongoose
- OpenAI API integration
- Cheerio for web scraping
- CORS enabled

## Setup

### Prerequisites
- Node.js (v22.16.0 or later)
- MongoDB instance
- OpenAI API key

### Environment Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd recipe-shopping-assistant
```

2. Create `.env` file in the server directory:
```
OPENAI_API_KEY=your_api_key_here
MONGODB_URI=your_mongodb_connection_string
PORT=3005
```

### Installation

1. Server Setup:
```bash
cd server
npm install
npm run dev
```

2. Client Setup:
```bash
cd client
npm install
npm run dev
```

The client will be available at `http://localhost:5173` and the server at `http://localhost:3005`.

## Development

- Client development server: `npm run dev` in the client directory
- Server development with hot-reload: `npm run dev` in the server directory
- Build for production: `npm run build` in respective directories

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 