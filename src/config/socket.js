let nanoid;
(async () => {
  const { nanoid: nano } = await import("nanoid");
  nanoid = nano;
})();
const ChallengeRoom = require("../model/challengeRoom");

function initSocket(io) {
  const challengeNamespace = io.of("/challenge");

  challengeNamespace.on("connection", (socket) => {
  

    socket.on("joinAsCreator", async ({ roomId, userId }) => {

      // Find room with case-insensitive search
      const room = await ChallengeRoom.findOne({
        roomId: { $regex: `^${roomId}$`, $options: "i" },
      }).populate("problem");

      if (!room) {
      
        return socket.emit("error", { message: "Room not found" });
      }

      // Use exact roomId from database
      socket.join(room.roomId);


      if (room.state === "running" && room.opponent) {
        socket.emit("challengeStarted", {
          problem: room.problem,
          startAt: room.startAt,
          durationSec: room.durationSec,
          state: "running",
          message: "⚡ Challenge already started!",
        });
      } else if (room.state === "finished") {
        socket.emit("winner", { winner: room.winner });
      } else {
        socket.emit("waiting", {
          message: "Waiting for opponent to join...",
          problem: room.problem,
          roomId: room.roomId,
          durationSec: room.durationSec,
        });
      }
    });

    socket.on("joinRoom", async ({ roomId, userId }) => {

      // Find room with case-insensitive search
      const room = await ChallengeRoom.findOne({
        roomId: { $regex: `^${roomId}$`, $options: "i" },
      }).populate("problem");

      if (!room) {
        return socket.emit("error", { message: "Room not found" });
      }

      // Use exact roomId from database
      socket.join(room.roomId);

      if (!room.creator) {
        room.creator = userId;
        room.state = "waiting";
        await room.save();
      } else if (!room.opponent) {
        room.opponent = userId;
        room.state = "running";
        room.startAt = Date.now();
        await room.save();


        // First notify about opponent joining
        challengeNamespace.to(room.roomId).emit("opponentJoined", {
          opponentId: userId,
          durationSec: room.durationSec,
        });

        // Then start the challenge for both users
        challengeNamespace.to(room.roomId).emit("challengeStarted", {
          problem: room.problem,
          startAt: room.startAt,
          durationSec: room.durationSec,
          state: "running",
          message: "⚡ Challenge started!",
        });
      } else {
        socket.emit("challengeStarted", {
          problem: room.problem,
          startAt: room.startAt,
          state: room.state,
          durationSec: room.durationSec,
          message: "⚡ Rejoining challenge!",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });

    // Handle code submission
    socket.on("submitCode", async ({ roomId, userId, status }) => {
      try {
        if (status === "accepted") {
          const room = await ChallengeRoom.findOneAndUpdate(
            { roomId },
            { state: "finished", winner: userId },
            { new: true }
          );

          if (room) {
            challengeNamespace.to(roomId).emit("winner", { winner: userId });
          }
        }
      } catch (err) {
        console.error("submitCode error:", err);
      }
    });

    // Handle disconnect
    socket.on("disconnecting", async () => {
      try {
        const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
        for (const roomId of rooms) {
          const room = await ChallengeRoom.findOne({ roomId });
          if (room && room.state === "running") {
            challengeNamespace.to(roomId).emit("userLeft");
            await ChallengeRoom.findOneAndUpdate(
              { roomId },
              { state: "finished" }
            );
          }
        }
      } catch (err) {
        console.error("disconnect error:", err);
      }
    });
  });
}

module.exports = initSocket;
