```markdown
# Chatterly

Chatterly is a scalable, real-time chat application built with modern technologies including Socket.io, Kafka, Redis, Postgres, and Next.js. This project demonstrates a robust architecture for handling multiple users with efficient message brokering and data storage.

## Features

- Real-time messaging with Socket.io
- Scalable message brokering using Kafka
- Efficient caching with Redis
- Persistent message storage in Postgres
- Frontend built with Next.js and TypeScript

## Prerequisites

- Node.js (v22 or higher)
- PostgreSQL
- Redis
- Kafka
- Yarn or npm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shivamxverma/chatterly.git
   cd chatterly
   ```

2. Install dependencies:
   ```bash
   yarn install
   # or
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/chatterly
   REDIS_URL=redis://localhost:6379
   KAFKA_BROKERS=localhost:9092
   NEXT_PUBLIC_SOCKET_IO_URL=http://localhost:3000
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the Kafka server and ensure Redis and Postgres are running.

## Running the Application

1. Start the development server:
   ```bash
   yarn dev
   # or
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`.

## Technologies Used

- **Next.js**: React framework for server-side rendering and static site generation
- **TypeScript**: Type-safe JavaScript
- **Socket.io**: Real-time bidirectional communication
- **Kafka**: Distributed message brokering
- **Redis**: In-memory caching
- **Postgres**: Relational database for persistent storage
- **Prisma**: ORM for database management
```
