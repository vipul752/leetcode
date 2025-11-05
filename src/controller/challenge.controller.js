const ChallengeRoom = require("../model/challengeRoom");
const Problem = require("../model/problem");

let nanoid;

(async () => {
  const { nanoid: nano } = await import("nanoid");
  nanoid = nano;
})();

const createNewChallengeRoom = async (req, res) => {
  const userId = req.result._id;
  try {
    const roomId = nanoid(8);

    const count = await Problem.countDocuments();
    const problem = await Problem.findOne().skip(
      Math.floor(Math.random() * count)
    );

    const room = await ChallengeRoom.create({
      roomId,
      creator: userId,
      problem: problem._id,
      state: "waiting",
    });

    await room.populate("problem");

    res.json({
      problem: room.problem,
      durationSec: room.durationSec,
      state: room.state,
      roomId: room.roomId,
      creator: room.creator,
      opponent: room.opponent,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create room" });
  }
};

const joinChallengeRoom = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.result._id;

  try {
    const room = await ChallengeRoom.findOne({
      roomId: { $regex: `^${roomId}$`, $options: "i" },
    }).populate("problem");

    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.opponent) {
      return res.status(400).json({ message: "Room already full" });
    }

    room.opponent = userId;
    room.state = "running";
    room.startAt = new Date();
    await room.save();

    // Emit socket event to notify creator that opponent joined
    const io = req.app.get("io");
    if (io) {
      const challengeNamespace = io.of("/challenge");
      console.log(
        `📢 HTTP: Notifying room ${room.roomId} that opponent joined`
      );

      // Notify that opponent joined
      challengeNamespace.to(room.roomId).emit("opponentJoined", {
        opponentId: userId,
        durationSec: room.durationSec,
      });

      // Start the challenge for both users
      challengeNamespace.to(room.roomId).emit("challengeStarted", {
        problem: room.problem,
        startAt: room.startAt,
        durationSec: room.durationSec,
        state: "running",
        message: "⚡ Challenge started!",
      });
    }

    res.json({
      problem: room.problem,
      durationSec: room.durationSec,
      state: room.state,
      roomId: room.roomId,
      creator: room.creator,
      opponent: room.opponent,
      startAt: room.startAt,
    });
  } catch (err) {
    console.error("Join room error:", err);
    res.status(500).json({ message: "Failed to join room" });
  }
};

const leaveChallengeRoom = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.result._id;

  try {
    const room = await ChallengeRoom.findOne({
      roomId: { $regex: `^${roomId}$`, $options: "i" },
    });
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.creator.toString() === userId) room.winner = room.opponent;
    else room.winner = room.creator;

    room.state = "finished";
    await room.save();
    res.json({ message: "Room left successfully", winner: room.winner });
  } catch (err) {
    res.status(500).json({ message: "Failed to leave room" });
  }
};

const getRoomStatus = async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = await ChallengeRoom.findOne({
      roomId: { $regex: `^${roomId}$`, $options: "i" },
    });

    if (!room) return res.status(404).json({ message: "Room not found" });

    res.json({
      roomId: room.roomId,
      state: room.state,
      creator: room.creator,
      opponent: room.opponent,
      startAt: room.startAt,
      durationSec: room.durationSec,
      winner: room.winner,
    });
  } catch (err) {
    console.error("Get room status error:", err);
    res.status(500).json({ message: "Failed to get room status" });
  }
};

module.exports = {
  createNewChallengeRoom,
  joinChallengeRoom,
  leaveChallengeRoom,
  getRoomStatus,
};
