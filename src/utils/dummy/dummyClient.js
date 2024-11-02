import net from 'net';
import { getProtoMessages, loadProtos } from '../../init/loadProtos.js';
import { v4 as uuidv4 } from 'uuid';
import Long from 'long';
import { config } from '../../config/config.js';

const HOST = '3.38.169.215';
const PORT = 5555;
const CLIENT_VERSION = '1.0.0';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// * 전체 길이
const TOTAL_LENGTH = 4;
// * 패킷 타입 길이
const PACKET_TYPE_LENGTH = 1;

const createPacket = (handlerId, userId, payload, clientVersion = '1.0.0', type, name) => {
  const protoMessages = getProtoMessages();
  const PayloadType = protoMessages[type][name];

  if (!PayloadType) throw new Error('PayloadType을 찾을 수 없습니다.');

  const payloadMessage = PayloadType.create(payload);
  const payloadBuffer = PayloadType.encode(payloadMessage).finish();

  return {
    handlerId,
    userId,
    version: clientVersion,
    payload: payloadBuffer,
  };
};

const sendPacket = (socket, packet) => {
  const protoMessages = getProtoMessages();
  const Packet = protoMessages.common.Packet;
  if (!Packet) {
    console.error('Packet 메시지를 찾을 수 없습니다.');
    return;
  }

  const buffer = Packet.encode(packet).finish();

  // 패킷 길이 정보를 포함한 버퍼 생성
  const packetLength = Buffer.alloc(config.packet.totalLength);
  // 패킷 길이에 타입 바이트 포함
  packetLength.writeUInt32BE(
    buffer.length + config.packet.totalLength + config.packet.typeLength,
    0,
  );

  // 패킷 타입 정보를 포함한 버퍼 생성
  const packetType = Buffer.alloc(config.packet.typeLength);
  packetType.writeUInt8(PACKET_TYPE.NORMAL, 0); // NORMAL TYPE

  // 길이 정보와 메시지를 함께 전송
  const packetWithLength = Buffer.concat([packetLength, packetType, buffer]);

  socket.write(packetWithLength);
};

const sendPong = (socket, timestamp) => {
  const protoMessages = getProtoMessages();
  const Ping = protoMessages.common.Ping;

  const pongMessage = Ping.create({ timestamp });
  const pongBuffer = Ping.encode(pongMessage).finish();
  // 패킷 길이 정보를 포함한 버퍼 생성
  const packetLength = Buffer.alloc(config.packet.totalLength);
  packetLength.writeUInt32BE(
    pongBuffer.length + config.packet.totalLength + config.packet.typeLength,
    0,
  );

  // 패킷 타입 정보를 포함한 버퍼 생성
  const packetType = Buffer.alloc(config.packet.typeLength);
  packetType.writeUInt8(PACKET_TYPE.PING, 0);

  // 길이 정보와 메시지를 함께 전송
  const packetWithLength = Buffer.concat([packetLength, packetType, pongBuffer]);

  socket.write(packetWithLength);
};

const PACKET_TYPE = {
  PING: 0,
  NORMAL: 1,
  LOCATION: 3,
};

const createDummyClient = (deviceId) => {
  const protoMessages = getProtoMessages();
  let userId;
  let socket = new net.Socket();
  let x = 0;
  let y = 0;
  let latency = 50 + Math.random() * 100;
  let speed = 3;

  let framerate = 30; // 10 ~ 30fpslet maxRadius = 200; // 반경 200 안에서 시작 위치를 설정
  let radius = 10; // 캐릭터가 이동할 원의 반지름 (작은 원)
  let maxRadius = 15; // 반경 200 안에서 시작 위치를 설정
  let centerX = Math.random() * (2 * maxRadius) - maxRadius; // 중심 x 좌표 (랜덤)
  let centerY = Math.random() * (2 * maxRadius) - maxRadius; // 중심 y 좌표 (랜덤)
  let angle = Math.random() * 2 * Math.PI; // 랜덤 초기 각도

  const sendLocationUpdate = () => {
    if (!userId) return;

    setTimeout(() => {
      const deltaTime = 1 / framerate;
      const angularSpeed = speed / radius; // 각속도

      angle += angularSpeed * deltaTime; // 각도 업데이트

      // 작은 원을 따라 이동할 새로운 x, y 좌표
      x = centerX + radius * Math.cos(angle);
      y = centerY + radius * Math.sin(angle);

      const packet = createPacket(
        2,
        deviceId,
        { x, y },
        CLIENT_VERSION,
        'game',
        'UpdateLocationPayload',
      );

      sendPacket(socket, packet);
    }, latency);
  };

  const init = () => {
    // * connect
    socket.connect(PORT, HOST, async () => {
      const successPacket = createPacket(
        0,
        deviceId,
        {
          deviceId,
          playerId: 1,
          latency,
        },
        CLIENT_VERSION,
        'initial',
        'InitialPayload',
      );
      await sendPacket(socket, successPacket);
      await delay(500);
    });

    // * onData
    socket.on('data', (data) => {
      if (data.length < config.packet.totalLength + config.packet.typeLength) {
        console.log('헤더 길이 체크 실패');
        return;
      }
      const length = data.readUInt32BE(0);
      const totalHeaderLength = config.packet.totalLength + config.packet.typeLength;
      const packetType = data.readUInt8(4);

      // 전체 패킷 길이 체크
      console.log(data.length, length);
      if (data.length < length) {
        return;
      }
      const packet = data.subarray(totalHeaderLength, length);

      if (packetType === PACKET_TYPE.NORMAL) {
        const Response = protoMessages.response.Response;

        try {
          const response = Response.decode(packet);
          const responseData = JSON.parse(Buffer.from(response.data).toString());

          if (response.handlerId === 0) {
            userId = responseData.userId;
          }
        } catch (e) {
          console.error(e);
        }
      } else if (packetType === PACKET_TYPE.PING) {
        try {
          const Ping = protoMessages.common.Ping;

          // ping 패킷 길이 검증
          if (packet.length < 7) {
            console.log('핑 패킷 체크 실패');
            return;
          }
          const actualPingData = packet.subarray(0, 7);
          const pingMessage = Ping.decode(actualPingData);

          const timestampLong = new Long(
            pingMessage.timestamp.low,
            pingMessage.timestamp.high,
            pingMessage.timestamp.unsigned,
          );
          sendPong(socket, timestampLong.toNumber());
        } catch (pongError) {
          console.error('Ping 처리 중 오류 발생:', pongError);
          console.error('Ping packet length:', packet.length);
          console.error('Raw ping packet:', packet);
        }
      }

      sendLocationUpdate();
    });

    // * onClose
    socket.on('close', () => {
      console.log('Connection closed');
    });

    // * onError
    socket.on('error', (err) => {
      console.error('Client error:', err);
    });
  };

  return {
    init,
  };
};

async function initializeClients() {
  await loadProtos();
  const LIMIT = 200;
  const DELAY_MS = 25; // 0.05초
  const dummies = [];

  for (let i = 0; i < LIMIT; i++) {
    await delay(DELAY_MS); // 0.05초 대기

    const deviceId = uuidv4().slice(0, 5);
    const dummy = createDummyClient(deviceId);
    dummies.push(dummy);
    dummy.init();
  }

  console.log(`${dummies.length}개의 클라이언트가 추가되었습니다.`);
}

// 함수 호출
initializeClients();
