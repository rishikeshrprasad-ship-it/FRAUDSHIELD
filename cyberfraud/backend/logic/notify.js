/**
 * Manages room-targeted socket notifications (io.to(room).emit()).
 */
export function sendRoomNotification(io, room, eventName, payload) {
  if (!io) return;
  if (room) {
    io.to(room).emit(eventName, payload);
  } else {
    io.emit(eventName, payload);
  }
}
