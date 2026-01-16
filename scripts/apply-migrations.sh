#!/bin/bash
# Apply Database Migrations Script
# This script applies all or specific migrations to your Supabase database

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed"
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MIGRATIONS_DIR="$SCRIPT_DIR/../migrations"

print_info "Database Migration Script"
echo ""

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    print_error "Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

# Parse arguments
SPECIFIC_FILE=""
ENVIRONMENT="production"

while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--file)
            SPECIFIC_FILE="$2"
            shift 2
            ;;
        -l|--local)
            ENVIRONMENT="local"
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -f, --file <file>    Apply specific migration file"
            echo "  -l, --local          Apply to local Supabase instance"
            echo "  -h, --help           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                           # Apply all migrations to production"
            echo "  $0 --local                   # Apply all migrations to local"
            echo "  $0 --file 001_initial_schema.sql  # Apply specific migration"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Check if linked to a project (for production)
if [ "$ENVIRONMENT" = "production" ]; then
    print_info "Checking Supabase project connection..."
    if ! supabase link --project-ref "${SUPABASE_PROJECT_ID:-}" 2>/dev/null; then
        print_warning "Not linked to a Supabase project"
        print_info "Run: supabase link --project-ref <your-project-ref>"
        exit 1
    fi
    print_success "Connected to Supabase project"
else
    print_info "Using local Supabase instance"
    # Check if local Supabase is running
    if ! supabase status 2>/dev/null | grep -q "API URL"; then
        print_error "Local Supabase is not running"
        print_info "Start it with: supabase start"
        exit 1
    fi
    print_success "Local Supabase is running"
fi

echo ""

# Function to apply a migration file
apply_migration() {
    local file=$1
    local filename=$(basename "$file")
    
    print_info "Applying migration: $filename"
    
    if [ ! -f "$file" ]; then
        print_error "File not found: $file"
        return 1
    fi
    
    # Check if it's a numbered migration (starts with digits)
    if [[ $filename =~ ^[0-9] ]]; then
        print_info "Processing numbered migration..."
    fi
    
    # Apply the migration
    if supabase db push --file "$file"; then
        print_success "Successfully applied: $filename"
        return 0
    else
        print_error "Failed to apply: $filename"
        return 1
    fi
}

# Apply migrations
FAILED=0
SUCCESSFUL=0

if [ -n "$SPECIFIC_FILE" ]; then
    # Apply specific file
    MIGRATION_PATH="$MIGRATIONS_DIR/$SPECIFIC_FILE"
    if [ ! -f "$MIGRATION_PATH" ]; then
        print_error "Migration file not found: $MIGRATION_PATH"
        exit 1
    fi
    
    if apply_migration "$MIGRATION_PATH"; then
        SUCCESSFUL=$((SUCCESSFUL + 1))
    else
        FAILED=$((FAILED + 1))
    fi
else
    # Apply all migrations in order
    print_info "Finding all migration files..."
    
    # Get all .sql files in migrations directory, sorted numerically
    MIGRATION_FILES=$(find "$MIGRATIONS_DIR" -maxdepth 1 -name "*.sql" -type f | sort)
    
    if [ -z "$MIGRATION_FILES" ]; then
        print_warning "No migration files found in $MIGRATIONS_DIR"
        exit 0
    fi
    
    # Count total migrations
    TOTAL=$(echo "$MIGRATION_FILES" | wc -l)
    print_info "Found $TOTAL migration file(s)"
    echo ""
    
    # Apply each migration
    CURRENT=0
    for file in $MIGRATION_FILES; do
        CURRENT=$((CURRENT + 1))
        print_info "[$CURRENT/$TOTAL] Processing $(basename "$file")"
        
        if apply_migration "$file"; then
            SUCCESSFUL=$((SUCCESSFUL + 1))
        else
            FAILED=$((FAILED + 1))
            print_error "Migration failed. Stopping."
            break
        fi
        echo ""
    done
fi

# Print summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILED -eq 0 ]; then
    print_success "All migrations applied successfully!"
    print_success "Successful: $SUCCESSFUL"
else
    print_error "Some migrations failed"
    echo "  Successful: $SUCCESSFUL"
    echo "  Failed: $FAILED"
    exit 1
fi

# Verify schema
echo ""
print_info "Verifying database schema..."
if supabase db dump --schema public > /tmp/schema_verify.sql 2>/dev/null; then
    TABLES=$(grep -c "CREATE TABLE" /tmp/schema_verify.sql || echo "0")
    print_success "Schema verified: $TABLES tables found"
else
    print_warning "Could not verify schema"
fi

print_success "Migration process complete!"
