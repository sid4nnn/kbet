# Casino Site

A full-stack online casino platform built with modern web technologies.

## 🚀 Features

-   **Authentication**: Secure user registration and login system.
-   **Wallet System**:
    -   Manage your balance (KCoins).
    -   Deposit funds (Admin feature available).
    -   View transaction history.
-   **Games**:
    -   **Blackjack**: A fully functional Blackjack game.
        -   Place bets.
        -   Hit, Stand, Double Down.
        -   Dealer logic included.
        -   Win/Loss payouts handled automatically.
-   **User Profile**:
    -   Track your progress with an XP system.
    -   Level up as you play.
-   **Responsive Design**: Optimized for various screen sizes.

## 🛠 Tech Stack

### Frontend
-   **React**: UI library.
-   **Vite**: Build tool for fast development.
-   **TypeScript**: Type safety.
-   **Tailwind CSS**: Utility-first CSS framework for styling.

### Backend
-   **Node.js**: Runtime environment.
-   **Express**: Web framework (if applicable, or custom routing).
-   **TypeScript**: Type safety.
-   **Prisma ORM**: Database interactions.

### Database
-   **SQLite** (Development): Lightweight database for local development.
-   **PostgreSQL** (Production ready): Can be easily switched in Prisma.

## 📂 Project Structure

-   `client/`: React frontend application.
-   `server/`: Node.js backend application.
-   `run.sh`: Script to run both client and server concurrently.

## 🏁 Getting Started

### Prerequisites
-   Node.js (v16+ recommended)
-   npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd casino-site
    ```

2.  **Install Dependencies:**
    You need to install dependencies for both the client and the server.

    ```bash
    # Root (if applicable)
    npm install

    # Client
    cd client
    npm install

    # Server
    cd ../server
    npm install
    ```

3.  **Database Setup:**
    Initialize the database using Prisma.

    ```bash
    cd server
    npx prisma generate
    npx prisma db push
    ```

4.  **Seed the Database (Optional):**
    Create a default admin user.

    ```bash
    # Inside server directory
    npm run seed
    ```

    **Default Admin Credentials:**
    -   **Email**: `admin@admin.com`
    -   **Password**: `Admin123`

### Running the Project

You can run both the client and server using the provided script in the root directory:

```bash
./run.sh
```

Alternatively, you can run them separately:

**Server:**
```bash
cd server
npm run dev
```

**Client:**
```bash
cd client
npm run dev
```

The client will typically run on `http://localhost:5173` and the server on `http://localhost:3000` (or configured ports).

## 🗄 Database Schema

The project uses **Prisma** with the following main models:

-   **User**: Stores user account info (email, password, role, xp).
-   **Wallet**: Manages user balance.
-   **GameTransaction**: Records all bets, wins, and financial movements.

For the full schema, check `server/prisma/schema.prisma`.
