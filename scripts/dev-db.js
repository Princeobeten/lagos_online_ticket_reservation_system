/**
 * Starts a throwaway MongoDB on port 27017 for people who cannot install
 * MongoDB locally. Data lives in .mongo-data/ so it survives a restart.
 *
 *   npm run db     (leave this running in its own terminal)
 */
import { MongoMemoryServer } from "mongodb-memory-server";
import { mkdirSync } from "node:fs";

const dbPath = ".mongo-data";
mkdirSync(dbPath, { recursive: true });

const mongo = await MongoMemoryServer.create({
  instance: { port: 27017, dbName: "lagos_otrs", dbPath, storageEngine: "wiredTiger" },
});

console.log(`MongoDB ready at ${mongo.getUri()}`);
console.log("Leave this running, then use npm run seed / npm run dev.");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await mongo.stop();
    process.exit(0);
  });
}
