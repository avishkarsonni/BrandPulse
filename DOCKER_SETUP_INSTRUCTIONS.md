# Docker Setup Instructions

## Problem Fixed
Docker was trying to connect to Docker Desktop's socket instead of the system Docker socket.

## Solution Applied
1. ✅ Added `DOCKER_HOST=unix:///var/run/docker.sock` to your `~/.zshrc`
2. ✅ Created helper script `run-docker.sh` for convenience

## How to Use

### Option 1: Open a New Terminal (Recommended)
The `DOCKER_HOST` is now in your `.zshrc`, so just open a **new terminal window** and run:
```bash
cd /home/avishkar/BrandPulse
docker compose up -d
```

### Option 2: Reload Current Terminal
If you want to use the current terminal without opening a new one:
```bash
source ~/.zshrc
cd /home/avishkar/BrandPulse
docker compose up -d
```

### Option 3: Use the Helper Script
Use the provided helper script that automatically sets the correct socket:
```bash
cd /home/avishkar/BrandPulse
./run-docker.sh up -d
```

### Option 4: Manual Export (Temporary)
For just this session:
```bash
export DOCKER_HOST=unix:///var/run/docker.sock
docker compose up -d
```

## Verify It Works
```bash
# Check if Docker is accessible
docker ps

# Check if docker compose can read the config
docker compose config --services
```

## Troubleshooting

If you still get the error:
1. **Check if DOCKER_HOST is set:**
   ```bash
   echo $DOCKER_HOST
   # Should output: unix:///var/run/docker.sock
   ```

2. **If not set, manually export it:**
   ```bash
   export DOCKER_HOST=unix:///var/run/docker.sock
   ```

3. **Verify system Docker is running:**
   ```bash
   systemctl status docker
   ```

4. **Check socket permissions:**
   ```bash
   ls -la /var/run/docker.sock
   # You should be in the 'docker' group to use it
   ```

5. **Add yourself to docker group (if needed):**
   ```bash
   sudo usermod -aG docker $USER
   # Then log out and log back in
   ```

## Note About GOOGLE_API_KEY Warning
The warning about `GOOGLE_API_KEY` is harmless - it just means the variable isn't set. You can ignore it unless you're using Google API features. To set it:
```bash
export GOOGLE_API_KEY=your_key_here
# Or add to ~/.zshrc:
echo 'export GOOGLE_API_KEY=your_key_here' >> ~/.zshrc
```

