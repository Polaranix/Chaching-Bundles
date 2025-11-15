#!/bin/bash

# Complete Test Runner for BundlesUp Shopify Apps
# This script runs all tests for both implementations

set -e  # Exit on error

echo "======================================"
echo "🧪 BundlesUp Test Suite Runner"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Track test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run tests for Remix app
test_remix_app() {
    echo ""
    echo "======================================"
    echo "Testing Remix App (bundle-and-save-app)"
    echo "======================================"
    echo ""

    cd /vercel/sandbox/bundle-and-save-app

    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not installed. Installing..."
        npm install
    fi

    # Check if Prisma client is generated
    print_info "Generating Prisma client..."
    npx prisma generate || {
        print_error "Prisma generate failed"
        ((TESTS_FAILED++))
        return 1
    }
    print_success "Prisma client generated"

    # Run type checking
    print_info "Running TypeScript type checking..."
    npm run typecheck || {
        print_error "Type checking failed"
        ((TESTS_FAILED++))
        return 1
    }
    print_success "Type checking passed"

    # Run unit tests
    print_info "Running unit tests..."
    npm test || {
        print_error "Unit tests failed"
        ((TESTS_FAILED++))
        return 1
    }
    print_success "Unit tests passed"
    ((TESTS_PASSED++))

    # Run tests with coverage (optional)
    if [ "$1" == "--coverage" ]; then
        print_info "Running tests with coverage..."
        npm test -- --coverage || {
            print_error "Coverage test failed"
            ((TESTS_FAILED++))
            return 1
        }
        print_success "Coverage test completed"
    fi

    print_success "Remix app tests completed!"
    return 0
}

# Function to test Base44 app
test_base44_app() {
    echo ""
    echo "======================================"
    echo "Testing Base44 App (bundlesup)"
    echo "======================================"
    echo ""

    cd /vercel/sandbox/bundlesup

    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Dependencies not installed. Installing..."
        npm install
    fi

    # Run type checking
    print_info "Running TypeScript compilation..."
    npm run build || {
        print_error "Build failed"
        ((TESTS_FAILED++))
        return 1
    }
    print_success "Build successful"
    ((TESTS_PASSED++))

    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from example..."
        cp .env.example .env
        print_info "Please update .env with your credentials"
    fi

    print_success "Base44 app tests completed!"
    return 0
}

# Function to run manual tests
run_manual_tests() {
    echo ""
    echo "======================================"
    echo "Manual Testing Checklist"
    echo "======================================"
    echo ""

    print_info "Manual tests require a running development server"
    echo ""
    echo "To test manually:"
    echo "  1. Start dev server: cd bundle-and-save-app && npm run dev"
    echo "  2. Open http://localhost:3000"
    echo "  3. Follow the checklist in COMPLETE_TESTING_GUIDE.md"
    echo ""
}

# Function to display test summary
display_summary() {
    echo ""
    echo "======================================"
    echo "📊 Test Summary"
    echo "======================================"
    echo ""
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo ""

    if [ $TESTS_FAILED -eq 0 ]; then
        print_success "All tests passed! 🎉"
        return 0
    else
        print_error "Some tests failed. Please review the output above."
        return 1
    fi
}

# Parse command line arguments
RUN_REMIX=true
RUN_BASE44=true
RUN_MANUAL=false
COVERAGE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --remix-only)
            RUN_BASE44=false
            shift
            ;;
        --base44-only)
            RUN_REMIX=false
            shift
            ;;
        --manual)
            RUN_MANUAL=true
            shift
            ;;
        --coverage)
            COVERAGE=true
            shift
            ;;
        --help)
            echo "Usage: ./run-all-tests.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --remix-only    Run tests for Remix app only"
            echo "  --base44-only   Run tests for Base44 app only"
            echo "  --manual        Show manual testing checklist"
            echo "  --coverage      Run tests with coverage report"
            echo "  --help          Show this help message"
            echo ""
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Main execution
main() {
    # Run tests based on flags
    if [ "$RUN_REMIX" = true ]; then
        if [ "$COVERAGE" = true ]; then
            test_remix_app --coverage
        else
            test_remix_app
        fi
    fi

    if [ "$RUN_BASE44" = true ]; then
        test_base44_app
    fi

    if [ "$RUN_MANUAL" = true ]; then
        run_manual_tests
    fi

    # Display summary
    display_summary
}

# Run main function
main

# Exit with appropriate code
if [ $TESTS_FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi
