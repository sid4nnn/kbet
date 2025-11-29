Casino Blackjack Project

This is an online casino platform currently in development. The project includes a full frontend and backend, with the first working game being Blackjack. The site is built with Vite + React + TypeScript on the client side and Node.js + Prisma on the backend.

Features

Home Screen: Sidebar for games, latest wins section, wallet balance, user info, user level, and a clean casino-themed layout.
Blackjack Game: Fully playable blackjack experience using the user's wallet balance. Includes game logic for hit, stand, dealer behavior, bust, and payouts. XP system planned based on money spent and wins.
Backend: API routes for user data, wallet operations, authentication, game results, and more. Prisma ORM manages database actions. Game history system is in progress.

Tech Stack

Frontend: React, Vite, TypeScript, Tailwind CSS (or your chosen styling).
Backend: Node.js, Express (if used), TypeScript, Prisma ORM.
Database: PostgreSQL (or your preferred DB).

Project Structure

root/client – React + Vite + TS frontend
root/server – Backend API + Prisma
root/run.sh – Script to run server and client
root/README.md