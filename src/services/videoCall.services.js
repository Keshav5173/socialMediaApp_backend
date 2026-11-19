const handleVideoCallEvent = (socket, io) => {

    // initiate video call
    socket.on("initiate_call", ({ callId, receiverId, callType, callerInfo }) => {
        const isOnline = io.sockets.adapter.rooms.has(receiverId);

        if (isOnline) {
            console.log("call going to", receiverId, callId);
            io.to(receiverId).emit("incoming_call", {
                callerId: socket.userId,
                callerName: callerInfo.username,
                callId,
                callType,
            });
        } else {
            console.log("server: Receiver is offline");
            socket.emit("call_failed", { reason: "User is Offline" });
        }
    });

    // accept call
    socket.on("accept_call", ({ callerId, callId, receiverInfo }) => {
        io.to(callerId).emit("call_accepted", {
            callerName: receiverInfo.username,
            callId,
        });
    });

    // reject call
    socket.on("reject_call", ({ callerId, callId }) => {
        io.to(callerId).emit("call_rejected", { callId });
    });

    // end call
    socket.on("end_call", ({ participantId, callId }) => {
        io.to(participantId).emit("call_ended", { callId });
    });

    // WebRTC signaling
    socket.on("webrtc_offer", ({ offer, receiverId, callId }) => {
        io.to(receiverId).emit("webrtc_offer", {
            offer,
            senderId: socket.userId,
            callId,
        });
    });

    socket.on("webrtc_answer", ({ answer, receiverId, callId }) => {
        io.to(receiverId).emit("webrtc_answer", {
            answer,
            senderId: socket.userId,
            callId,
        });
    });

    socket.on("webrtc_ice_candidate", ({ candidate, receiverId, callId }) => {
        io.to(receiverId).emit("webrtc_ice_candidate", {
            candidate,
            senderId: socket.userId,
            callId,
        });
    });
};

export { handleVideoCallEvent };