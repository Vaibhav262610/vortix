const prisma = require('./prisma');

/**
 * Create or update user from Clerk
 */
async function upsertUser(clerkUser) {
    return await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: {
            email: clerkUser.emailAddresses[0]?.emailAddress,
            username: clerkUser.username,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
        },
        create: {
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            username: clerkUser.username,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl,
        },
    });
}

/**
 * Get user by Clerk ID
 */
async function getUserByClerkId(clerkId) {
    return await prisma.user.findUnique({
        where: { clerkId },
        include: {
            devices: true,
        },
    });
}

/**
 * Create or update device
 */
async function upsertDevice(userId, deviceData) {
    return await prisma.device.upsert({
        where: { deviceId: deviceData.deviceId },
        update: {
            deviceName: deviceData.deviceName,
            platform: deviceData.platform || 'unknown',
            status: deviceData.status || 'offline',
            lastSeen: new Date(),
        },
        create: {
            userId,
            deviceId: deviceData.deviceId,
            deviceName: deviceData.deviceName,
            passwordHash: deviceData.passwordHash,
            platform: deviceData.platform || 'unknown',
            status: deviceData.status || 'offline',
            lastSeen: new Date(),
        },
    });
}

/**
 * Get device by device ID
 */
async function getDeviceByDeviceId(deviceId) {
    return await prisma.device.findUnique({
        where: { deviceId },
        include: {
            user: true,
        },
    });
}

/**
 * Get all devices for a user
 */
async function getUserDevices(userId) {
    return await prisma.device.findMany({
        where: { userId },
        orderBy: { lastSeen: 'desc' },
    });
}

/**
 * Update device status
 */
async function updateDeviceStatus(deviceId, status) {
    return await prisma.device.update({
        where: { deviceId },
        data: {
            status,
            lastSeen: new Date(),
        },
    });
}

/**
 * Save command to history
 */
async function saveCommandHistory(data) {
    return await prisma.commandHistory.create({
        data: {
            userId: data.userId,
            deviceId: data.deviceId,
            command: data.command,
            output: data.output,
            exitCode: data.exitCode,
            status: data.status || 'success',
            duration: data.duration,
        },
    });
}

/**
 * Get command history for a user
 */
async function getCommandHistory(userId, options = {}) {
    const { deviceId, limit = 50, offset = 0, search } = options;

    const where = {
        userId,
        ...(deviceId && { deviceId }),
        ...(search && {
            command: {
                contains: search,
                mode: 'insensitive',
            },
        }),
    };

    const [commands, total] = await Promise.all([
        prisma.commandHistory.findMany({
            where,
            include: {
                device: {
                    select: {
                        deviceName: true,
                        platform: true,
                    },
                },
            },
            orderBy: { executedAt: 'desc' },
            take: limit,
            skip: offset,
        }),
        prisma.commandHistory.count({ where }),
    ]);

    return { commands, total };
}

/**
 * Get command history for a device
 */
async function getDeviceCommandHistory(deviceId, limit = 50) {
    return await prisma.commandHistory.findMany({
        where: { deviceId },
        orderBy: { executedAt: 'desc' },
        take: limit,
    });
}

/**
 * Search command history
 */
async function searchCommandHistory(userId, searchTerm, limit = 20) {
    return await prisma.commandHistory.findMany({
        where: {
            userId,
            command: {
                contains: searchTerm,
                mode: 'insensitive',
            },
        },
        include: {
            device: {
                select: {
                    deviceName: true,
                    platform: true,
                },
            },
        },
        orderBy: { executedAt: 'desc' },
        take: limit,
    });
}

/**
 * Get command statistics
 */
async function getCommandStats(userId) {
    const [totalCommands, successCommands, errorCommands, recentCommands] = await Promise.all([
        prisma.commandHistory.count({ where: { userId } }),
        prisma.commandHistory.count({ where: { userId, status: 'success' } }),
        prisma.commandHistory.count({ where: { userId, status: 'error' } }),
        prisma.commandHistory.findMany({
            where: { userId },
            orderBy: { executedAt: 'desc' },
            take: 10,
            include: {
                device: {
                    select: {
                        deviceName: true,
                    },
                },
            },
        }),
    ]);

    return {
        totalCommands,
        successCommands,
        errorCommands,
        successRate: totalCommands > 0 ? (successCommands / totalCommands) * 100 : 0,
        recentCommands,
    };
}

/**
 * Delete old command history (cleanup)
 */
async function deleteOldCommandHistory(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    return await prisma.commandHistory.deleteMany({
        where: {
            executedAt: {
                lt: cutoffDate,
            },
        },
    });
}

module.exports = {
    upsertUser,
    getUserByClerkId,
    upsertDevice,
    getDeviceByDeviceId,
    getUserDevices,
    updateDeviceStatus,
    saveCommandHistory,
    getCommandHistory,
    getDeviceCommandHistory,
    searchCommandHistory,
    getCommandStats,
    deleteOldCommandHistory,
};
