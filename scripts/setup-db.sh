#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   U-Topia Database Setup Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo -e "${BLUE}Creating .env from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and add your database credentials${NC}"
    echo ""
    read -p "Press enter when you've updated .env file..."
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo -e "${BLUE}Install PostgreSQL using:${NC}"
    echo "  brew install postgresql@15"
    echo "  brew services start postgresql@15"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is installed${NC}"

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not running${NC}"
    echo -e "${BLUE}Starting PostgreSQL...${NC}"
    brew services start postgresql@15
    sleep 2
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Generate Prisma Client
echo ""
echo -e "${BLUE}Generating Prisma Client...${NC}"
npx prisma generate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prisma Client generated${NC}"
else
    echo -e "${RED}❌ Failed to generate Prisma Client${NC}"
    exit 1
fi

# Run migrations
echo ""
echo -e "${BLUE}Running database migrations...${NC}"
npx prisma migrate dev --name init

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations completed successfully${NC}"
else
    echo -e "${RED}❌ Migration failed${NC}"
    echo -e "${YELLOW}Check your DATABASE_URL in .env${NC}"
    exit 1
fi

# Seed database (optional)
echo ""
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Seeding database...${NC}"
    npx prisma db seed
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database seeded${NC}"
    else
        echo -e "${YELLOW}⚠️  Seeding skipped or failed${NC}"
    fi
fi

# Open Prisma Studio
echo ""
read -p "Do you want to open Prisma Studio to view your database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Opening Prisma Studio...${NC}"
    npx prisma studio &
    echo -e "${GREEN}✅ Prisma Studio opened at http://localhost:5555${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Start your development server: pnpm dev"
echo "  2. Begin migrating your code (see MIGRATION_GUIDE.md)"
echo "  3. Test authentication and database operations"
echo ""
echo -e "${BLUE}Useful commands:${NC}"
echo "  npx prisma studio       - Visual database editor"
echo "  npx prisma migrate dev  - Create new migration"
echo "  npx prisma db push      - Push schema changes"
echo ""
