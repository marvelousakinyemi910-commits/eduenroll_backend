-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'INSTRUCTOR', 'ADMIN') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `refreshToken` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departments` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `faculty` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `departments_name_key`(`name`),
    UNIQUE INDEX `departments_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `semesters` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `session` VARCHAR(191) NOT NULL,
    `registrationStart` DATETIME(3) NOT NULL,
    `registrationEnd` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `semesters_name_session_key`(`name`, `session`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `instructors` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `instructorNo` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `office` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `instructors_userId_key`(`userId`),
    UNIQUE INDEX `instructors_instructorNo_key`(`instructorNo`),
    UNIQUE INDEX `instructors_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `studentNo` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `faculty` VARCHAR(191) NOT NULL,
    `level` INTEGER NOT NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `dob` DATETIME(3) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `students_userId_key`(`userId`),
    UNIQUE INDEX `students_studentNo_key`(`studentNo`),
    UNIQUE INDEX `students_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `credits` INTEGER NOT NULL,
    `instructorId` VARCHAR(191) NULL,
    `semesterId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `scheduleDay` VARCHAR(191) NULL,
    `scheduleStart` VARCHAR(191) NULL,
    `scheduleEnd` VARCHAR(191) NULL,
    `venue` VARCHAR(191) NULL,
    `maxStudents` INTEGER NOT NULL,
    `currentEnrollment` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `courses_code_semesterId_key`(`code`, `semesterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `registrations` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `semesterId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'DROPPED') NOT NULL DEFAULT 'PENDING',
    `registeredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `droppedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `registrations_studentId_courseId_key`(`studentId`, `courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grades` (
    `id` VARCHAR(191) NOT NULL,
    `registrationId` VARCHAR(191) NOT NULL,
    `letter` ENUM('A', 'B', 'C', 'D', 'E', 'F') NOT NULL,
    `gradePoint` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `grades_registrationId_key`(`registrationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_CoursePrerequisites` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_CoursePrerequisites_AB_unique`(`A`, `B`),
    INDEX `_CoursePrerequisites_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admins` ADD CONSTRAINT `admins_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructors` ADD CONSTRAINT `instructors_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `instructors` ADD CONSTRAINT `instructors_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `instructors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `semesters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `semesters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grades` ADD CONSTRAINT `grades_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `registrations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CoursePrerequisites` ADD CONSTRAINT `_CoursePrerequisites_A_fkey` FOREIGN KEY (`A`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CoursePrerequisites` ADD CONSTRAINT `_CoursePrerequisites_B_fkey` FOREIGN KEY (`B`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
