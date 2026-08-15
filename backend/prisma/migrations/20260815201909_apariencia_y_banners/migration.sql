-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "businessName" TEXT NOT NULL DEFAULT 'PetShop',
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#ea7c1e',
    "heroTitle" TEXT NOT NULL DEFAULT 'Todo para tu mascota, en un solo lugar',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Alimento, juguetes, higiene y accesorios para perros, gatos y más.',
    "heroImageUrl" TEXT,
    "sectionsOrder" TEXT NOT NULL DEFAULT 'hero,banners,categories,products',
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "subtitle" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
