#!/bin/bash

cd server
npm run dev &
SERVER_PID=$!

cd ../client
npm run build
npm run dev &
CLIENT_PID=$!

wait $SERVER_PID
wait $CLIENT_PID