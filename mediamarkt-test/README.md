# mediamarkt-test


## Installation Steps

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd mediamarkt-test
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   - Create an`.env`
   - Ensure the `MONGO_URI` is set to your MongoDB Docker container in .env (default: `mongodb://localhost:27017/marketplace`).

4. **Start required Docker containers:**
   - **MongoDB:**
     ```sh
     docker run -d --name mongodb -p 27017:27017 mongo
     ```
   - **RabbitMQ:**
     ```sh
     docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
     ```

5. **Run the application:**
   ```sh
   npm run start:dev
   ```

## Notes
- Make sure Docker is installed and running on your machine.
- The application requires both MongoDB and RabbitMQ containers to be running.
- Access RabbitMQ management UI at [http://localhost:15672](http://localhost:15672) (default user/pass: guest/guest).

---
