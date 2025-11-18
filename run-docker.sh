#!/bin/bash
# Helper script to run Docker Compose with correct socket
# This ensures Docker uses the system socket instead of Docker Desktop

export DOCKER_HOST=unix:///var/run/docker.sock

# Run docker compose with all arguments passed to this script
docker compose "$@"

