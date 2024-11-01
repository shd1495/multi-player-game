# multi-player-game
![메인 화면](https://github.com/user-attachments/assets/54bba436-274e-4b0a-8430-cf9e15284448)
## 기술 스택
- Node.js - net
  
- MySQL - AWS RDS
  
- deployment - AWS EC2
  
- PackageManager - Yarn

- packet - protobufjs

## 실행 방법
- https://github.com/shd1495/multi-player-client 이동
  
- code -> Download ZIP -> 압축 해제 후 exe 파일 실행

- deviceId - 아무거나 입력

- IP - 3.38.169.215

- PORT - 5555

## 필수

- [x] 처음부터 프로젝트 생성
- [x] 프로젝트의 구성 과 게임 인스턴스 생성
- [x] 유저 접속
- [x] 유저 인스턴스 생성
- [x] 위치 패킷 교환

## 도전

- [x] DB 연동
- [x] Latency 를 이용한 추측항법 적용 
- [x] 핑 패킷 교환

## 패킷 구조
[![pngwing com](https://github.com/user-attachments/assets/0b16d6ab-5527-4ff3-8201-a86b290ee0ed)](https://frosted-occupation-9b9.notion.site/multi-player-game-1306a99984a1805abc11d7e56c5b81d4)

## 트러블 슈팅
[![71e4d050cc5588bf30aea2387817b22f8ed74fe1564678be862e341fb6ce5fe9](https://github.com/user-attachments/assets/f6e11b34-53b1-4b61-af8e-4d12ab005527)](https://velog.io/@zkzkdh451/2024.10.31-TIL-multi-player-game)

## DB 연동
### 스키마
```sql
    id         VARCHAR(36) PRIMARY KEY,
    device_id  VARCHAR(255) UNIQUE NOT NULL,
    x          FLOAT DEFAULT 0 NOT NULL,
    y          FLOAT DEFAULT 0 NOT NULL,
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```
### 쿼리
```sql
유저 찾기 / FIND_USER_BY_DEVICE_ID:    'SELECT * FROM user WHERE device_id = ?',
유저 생성 / CREATE_USER:    'INSERT INTO user (id, device_id) VALUES (?, ?)',
마지막 접속 시간 기록 / UPDATE_USER_LOGIN:    'UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE device_id = ?',
마지막 위치 기록 / UPDATE_USER_POSITION:    'UPDATE user SET x = ?, y = ? WHERE device_id = ?',
```

## 인터벌 매니저
- 주기적인 핑 통신을 관리할 인터벌 매니저

- 게임 세션 당 인터벌 매니저 인스턴스를 생성

- 유저가 게임 세션에 접속하면 인터벌을 생성하고 1초 마다 클라이언트와 서버가 핑 교환을 하도록 인터벌 생성

- 유저가 접속 종료시 인터벌 삭제

## ping 교환
- 현재 시간을 timestamp로 클라이언트에 보내고 클라이언트가 다시 서버로 보낸다

- 현재 시간에서 받은 시간을 빼고 2로 나눠서 편도로 계산된 latency를 구한다
  
## latency 추측항법
### 핑 교환을 통한 latency 산출
- 유저 별 latency를 바탕으로 위치 동기화할 때 미리 계산된 위치를 보낸다.
```js
const hasMoved = this.x !== this.lastX || this.y !== this.lastY;
if (!hasMoved) return { x: this.x, y: this.y };

// 이동 시간이 짧거나 latency가 작으면 timeDiff도 적어지고, distance도 작아짐
const timeDiff = (Date.now() - this.lastUpdateTime + latency) / 1000; // 초 단위
const distance = this.speed * timeDiff;

// 방향 계산
const directionX = Math.sign(this.x - this.lastX);
const directionY = Math.sign(this.y - this.lastY);

return {
x: this.x + directionX * distance,
y: this.y + directionY * distance,
};
 ```


