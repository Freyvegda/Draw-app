import { prismaClient } from "@repo/db/client";

async function main() {
  try {
    const roomIds = [
      "f3b8c3b2-5d6e-4a4f-91c7-123456789abc",
      "a7d91b1e-02d9-4b6d-bf66-987654321def"
    ];

    const result = await prismaClient.room.deleteMany({
      where: {
        id: { in: roomIds },
      },
    });

    console.log(`Deleted ${result.count} rooms successfully.`);
  } catch (err) {
    console.error(err);
  } finally {
    await prismaClient.$disconnect();
  }
}

main();
