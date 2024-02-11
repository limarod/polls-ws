-- CreateTable
CREATE TABLE "PollOptions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pollsId" TEXT NOT NULL,

    CONSTRAINT "PollOptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PollOptions" ADD CONSTRAINT "PollOptions_pollsId_fkey" FOREIGN KEY ("pollsId") 
REFERENCES "Polls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
