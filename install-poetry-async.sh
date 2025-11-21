#!/bin/bash

# BrandPulse - Async Poetry Installation Script
# This script installs dependencies using Poetry with parallel processing

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Function to print colored messages
print_header() {
    echo -e "\n${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BOLD}${CYAN}  $1${NC}"
    echo -e "${BOLD}${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_step() {
    echo -e "${MAGENTA}🔹 $1${NC}"
}

# Function to install Poetry if not present
install_poetry() {
    if ! command -v poetry > /dev/null 2>&1; then
        print_step "Poetry not found. Installing Poetry..."
        curl -sSL https://install.python-poetry.org | python3 -
        
        # Add Poetry to PATH for current session
        export PATH="$HOME/.local/bin:$PATH"
        
        # Verify installation
        if ! command -v poetry > /dev/null 2>&1; then
            print_error "Poetry installation failed"
            exit 1
        fi
        print_success "Poetry installed successfully"
    else
        print_success "Poetry is already installed"
    fi
}

# Function to configure Poetry for optimal performance
configure_poetry() {
    print_step "Configuring Poetry for optimal performance..."
    
    # Configure Poetry settings for better performance
    poetry config virtualenvs.create true
    poetry config virtualenvs.in-project true
    poetry config installer.parallel true
    poetry config installer.max-workers 10
    poetry config cache-dir ~/.cache/pypoetry
    
    print_success "Poetry configured for parallel installation"
}

# Function to install dependencies with progress tracking
install_dependencies_async() {
    print_step "Installing dependencies asynchronously..."
    
    # Create a temporary file to track progress
    local progress_file="/tmp/poetry_install_progress"
    echo "0" > "$progress_file"
    
    # Start Poetry installation in background
    (
        poetry install --extras "all" 2>&1 | while IFS= read -r line; do
            echo "$line" >> /tmp/poetry_install.log
            # Update progress based on output
            if echo "$line" | grep -q "Installing"; then
                current=$(cat "$progress_file")
                echo $((current + 1)) > "$progress_file"
            fi
        done
        echo "DONE" > "$progress_file"
    ) &
    
    local install_pid=$!
    
    # Show progress while installation is running
    print_info "Installing packages in parallel..."
    local spinner_chars="⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏"
    local spinner_index=0
    
    while [ "$(cat "$progress_file")" != "DONE" ]; do
        local current_progress=$(cat "$progress_file")
        local spinner_char="${spinner_chars:$spinner_index:1}"
        printf "\r${CYAN}${spinner_char} Installing packages... (${current_progress} packages processed)${NC}"
        
        spinner_index=$(( (spinner_index + 1) % ${#spinner_chars} ))
        sleep 0.2
    done
    
    # Wait for installation to complete
    wait $install_pid
    local exit_code=$?
    
    printf "\r${GREEN}✅ Installation completed!                                    ${NC}\n"
    
    # Clean up
    rm -f "$progress_file"
    
    if [ $exit_code -eq 0 ]; then
        print_success "All dependencies installed successfully"
    else
        print_error "Installation failed. Check /tmp/poetry_install.log for details"
        exit 1
    fi
}

# Function to install development dependencies separately (optional)
install_dev_dependencies() {
    if [ "$1" = "--with-dev" ]; then
        print_step "Installing development dependencies..."
        poetry install --with dev &
        local dev_pid=$!
        
        # Show progress
        while kill -0 $dev_pid 2>/dev/null; do
            echo -n "."
            sleep 1
        done
        echo ""
        
        wait $dev_pid
        if [ $? -eq 0 ]; then
            print_success "Development dependencies installed"
        else
            print_warning "Development dependencies installation failed"
        fi
    fi
}

# Function to install ML dependencies separately (optional)
install_ml_dependencies() {
    if [ "$1" = "--with-ml" ] || [ "$2" = "--with-ml" ]; then
        print_step "Installing ML dependencies (TensorFlow, etc.)..."
        poetry install --with ml &
        local ml_pid=$!
        
        # Show progress for ML installation (usually takes longer)
        print_info "Installing ML packages (this may take a while)..."
        while kill -0 $ml_pid 2>/dev/null; do
            echo -n "🧠"
            sleep 3
        done
        echo ""
        
        wait $ml_pid
        if [ $? -eq 0 ]; then
            print_success "ML dependencies installed"
        else
            print_warning "ML dependencies installation failed"
        fi
    fi
}

# Function to verify installation
verify_installation() {
    print_step "Verifying installation..."
    
    # Check if virtual environment was created
    if [ -d ".venv" ]; then
        print_success "Virtual environment created successfully"
    else
        print_warning "Virtual environment not found"
    fi
    
    # Test Poetry environment
    if poetry run python -c "import fastapi, uvicorn; print('Core dependencies working')" 2>/dev/null; then
        print_success "Core dependencies are working"
    else
        print_error "Core dependencies verification failed"
    fi
    
    # Show installed packages count
    local package_count=$(poetry show | wc -l)
    print_info "Total packages installed: $package_count"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --with-dev    Install development dependencies"
    echo "  --with-ml     Install ML/AI dependencies"
    echo "  --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Install core dependencies only"
    echo "  $0 --with-dev         # Install with development tools"
    echo "  $0 --with-ml          # Install with ML/AI packages"
    echo "  $0 --with-dev --with-ml  # Install everything"
}

# Main execution
main() {
    clear
    print_header "BrandPulse - Async Poetry Installation"
    
    # Parse arguments
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_usage
        exit 0
    fi
    
    # Change to project directory
    cd "$(dirname "$0")"
    
    # Check if pyproject.toml exists
    if [ ! -f "pyproject.toml" ]; then
        print_error "pyproject.toml not found. Please run this script from the project root."
        exit 1
    fi
    
    # Install and configure Poetry
    install_poetry
    configure_poetry
    
    # Install dependencies
    install_dependencies_async
    
    # Install optional dependencies
    install_dev_dependencies "$1"
    install_ml_dependencies "$1" "$2"
    
    # Verify installation
    verify_installation
    
    print_header "Installation Complete!"
    print_success "BrandPulse dependencies installed successfully with Poetry"
    echo ""
    print_info "To activate the environment: poetry shell"
    print_info "To run commands: poetry run <command>"
    print_info "To add new packages: poetry add <package>"
    echo ""
    print_step "Next steps:"
    echo "  1. Run: poetry shell (to activate environment)"
    echo "  2. Run: ./run.sh start (to start all services)"
    echo "  3. Visit: http://localhost:3000 (frontend)"
    echo ""
}

# Run main function with all arguments
main "$@"
