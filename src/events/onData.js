import { config } from '../config/config.js';
import { PACKET_TYPE } from '../constants/header.js';
import { getHandlerById } from '../handlers/index.js';
import { packetParser } from '../utils/parser/packetParser.js';

export const onData = (socket) => async (data) => {
  socket.buffer = Buffer.concat([socket.buffer, data]);

  const totalHeaderLength = config.packet.totalLength + config.packet.typeLength; // 4 + 1

  //buffer에 담긴 데이터의 길이가 헤더보다 길면 파싱 시작
  while (socket.buffer.length > totalHeaderLength) {
    const length = socket.buffer.readUInt32BE(0);
    const packetType = socket.buffer.readUInt8(config.packet.totalLength);

    if (socket.buffer.length >= length) {
      const packet = socket.buffer.subarray(totalHeaderLength, length);
      // 남은 부분
      socket.buffer = socket.buffer.subarray(length);
      try {
        // 패킷 파서
        switch (packetType) {
          case PACKET_TYPE.PING:
            break;
          case PACKET_TYPE.NORMAL:
            const { handlerId, userId, payload } = packetParser(packet);
            const handler = getHandlerById(handlerId);

            handler({ socket, userId, payload });
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      break;
    }
  }
};
