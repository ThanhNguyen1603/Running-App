# Running Challenge App — CLAUDE.md

## Mô tả dự án

App quản lý giải chạy bộ cho nhóm, tương tự VRace nhưng đơn giản hơn.
- Người dùng đăng ký tài khoản trong app, sau đó kết nối Strava để sync dữ liệu chạy
- Admin (1 người duy nhất — chủ app) tạo giải chạy và nhóm, chia invite code
- Thành viên nhóm theo dõi tiến độ và bảng xếp hạng của nhau

## Cấu trúc monorepo

```
d:\App Running\
├── backend/     — Node.js + Express + TypeScript + Prisma
├── mobile/      — React Native (Expo) + TypeScript
└── CLAUDE.md
```

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **ORM**: Prisma (PostgreSQL)
- **Auth**: JWT (access token 15min, refresh token 7 ngày) + bcrypt (saltRounds=12)
- **Validation**: Zod
- **Security**: helmet, express-rate-limit
- **Deploy**: Railway.app
- **Database**: Supabase (managed PostgreSQL)

### Mobile
- **Framework**: Expo (React Native) + TypeScript
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **State**: Zustand (persist) + MMKV (storage)
- **HTTP**: Axios với JWT interceptor + auto token refresh
- **Charts**: react-native-chart-kit + react-native-svg
- **Auth browser**: expo-web-browser (openAuthSessionAsync)
- **Deep link scheme**: `runningapp://`

## Database Schema (Prisma)

Xem file: `backend/prisma/schema.prisma`

Models: `User`, `StravaConnection`, `Challenge`, `Group`, `GroupMember`, `Activity`

**Pace convention quan trọng**:
- Strava trả về `average_speed` (m/s) → chuyển sang `paceSecPerKm = round(1000 / average_speed)`
- Lưu trong DB dưới dạng `Int` (số giây/km), không phải string
- `minPaceSecPerKm` = pace chậm nhất cho phép (vd: 600 = 10:00/km)
- `maxPaceSecPerKm` = pace nhanh nhất cho phép (vd: 240 = 4:00/km)

## API Endpoints

### Auth
| Method | Route | Auth | Mô tả |
|---|---|---|---|
| POST | /auth/register | - | Đăng ký email + password |
| POST | /auth/login | - | Trả về accessToken + refreshToken |
| POST | /auth/refresh | - | Đổi refresh token lấy access token mới |

### Strava
| Method | Route | Auth | Mô tả |
|---|---|---|---|
| GET | /strava/connect | JWT | Redirect đến Strava OAuth |
| GET | /strava/callback | - (state=userId) | Callback từ Strava, lưu token, redirect về app |
| DELETE | /strava/disconnect | JWT | Xóa kết nối Strava |
| GET | /strava/status | JWT | Kiểm tra đã kết nối chưa |

### Activities
| Method | Route | Auth | Mô tả |
|---|---|---|---|
| POST | /activities/sync | JWT | Kéo thủ công từ Strava, validate, lưu DB |
| GET | /activities | JWT | Danh sách hoạt động (phân trang) |

### Challenges (tạo cần Admin)
| Method | Route | Auth | Mô tả |
|---|---|---|---|
| POST | /challenges | JWT+Admin | Tạo giải |
| GET | /challenges | JWT | Danh sách giải |
| GET | /challenges/:id | JWT | Chi tiết + luật giải |

### Groups
| Method | Route | Auth | Mô tả |
|---|---|---|---|
| POST | /groups | JWT+Admin | Tạo nhóm cho giải |
| GET | /groups | JWT | Nhóm của user |
| GET | /groups/:id | JWT | Chi tiết + thành viên |
| POST | /groups/:id/join | JWT | Tham gia bằng invite code |
| GET | /groups/:id/leaderboard | JWT | Bảng xếp hạng |

### Webhook
| Method | Route | Auth | Mô tả |
|---|---|---|---|
| GET | /webhook/strava | - | Strava validation handshake |
| POST | /webhook/strava | verify_token | Nhận event activity mới |

## Mobile Navigation

```
App khởi động (đọc MMKV)
  ├─ Chưa login → AuthNavigator
  │     ├─ LoginScreen
  │     └─ RegisterScreen
  └─ Đã login
      ├─ stravaConnected = false → ConnectStravaScreen
      └─ stravaConnected = true → MainNavigator (Bottom Tabs)
            ├─ GroupListScreen → GroupDetailScreen (leaderboard)
            ├─ ProfileScreen
            └─ [isAdmin] → AdminNavigator
                  ├─ CreateChallengeScreen
                  └─ CreateGroupScreen (hiển thị invite code)
```

## Strava OAuth Flow (Mobile → Backend)

1. Mobile mở URL: backend `GET /strava/connect` (server redirect đến Strava)
2. User approve trên Strava.com
3. Strava callback về `GET /strava/callback?code=...&state={userId}`
4. Backend exchange code → lưu tokens vào DB → redirect `runningapp://strava?success=true`
5. Mobile nhận deep link → `authStore.setStravaConnected(true)` → vào MainNavigator

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://...
JWT_SECRET=
JWT_REFRESH_SECRET=
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REDIRECT_URI=https://<railway-url>/strava/callback
STRAVA_WEBHOOK_VERIFY_TOKEN=
MOBILE_DEEP_LINK=runningapp
PORT=3000
NODE_ENV=development
ADMIN_EMAIL=                  # email của admin, dùng khi seed
ADMIN_PASSWORD=               # password của admin, dùng khi seed
```

### Mobile (`mobile/.env`)
```
EXPO_PUBLIC_API_URL=https://<railway-url>
```

## Backend File Structure

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts               — seed admin user
├── src/
│   ├── config/
│   │   ├── db.ts             — Prisma client singleton
│   │   ├── env.ts            — Zod env validation
│   │   └── strava.ts         — Strava OAuth constants
│   ├── middleware/
│   │   ├── auth.ts           — JWT verify, gán req.userId + req.isAdmin
│   │   ├── adminOnly.ts      — kiểm tra isAdmin
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts   — global error handler
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── strava.routes.ts
│   │   ├── activities.routes.ts
│   │   ├── challenges.routes.ts
│   │   ├── groups.routes.ts
│   │   ├── users.routes.ts
│   │   └── webhook.routes.ts
│   ├── controllers/          — tương ứng với routes
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── strava.service.ts — OAuth exchange, token refresh, API calls
│   │   ├── activities.service.ts — sync + validate
│   │   ├── leaderboard.service.ts — SQL aggregation
│   │   └── webhook.service.ts
│   ├── validators/           — Zod schemas
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── pagination.ts
│   │   └── logger.ts
│   ├── app.ts                — Express setup, middleware, routes
│   └── server.ts             — HTTP server entry point
├── .env
├── .env.example
├── package.json
└── tsconfig.json
```

## Mobile File Structure

```
mobile/
├── src/
│   ├── screens/
│   │   ├── auth/             — LoginScreen, RegisterScreen
│   │   ├── onboarding/       — ConnectStravaScreen
│   │   ├── groups/           — GroupListScreen, GroupDetailScreen, JoinGroupScreen
│   │   └── admin/            — AdminScreen, CreateChallengeScreen, CreateGroupScreen
│   ├── navigation/
│   │   ├── AppNavigator.tsx  — root, đọc authStore → chọn navigator
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx — bottom tabs
│   │   └── AdminNavigator.tsx
│   ├── stores/
│   │   ├── authStore.ts      — accessToken, userId, isAdmin, stravaConnected
│   │   └── challengeStore.ts — active challenge rules
│   ├── api/
│   │   ├── client.ts         — Axios + JWT interceptor + auto-refresh on 401
│   │   ├── auth.api.ts
│   │   ├── strava.api.ts
│   │   ├── activities.api.ts
│   │   ├── challenges.api.ts
│   │   └── groups.api.ts
│   ├── components/
│   │   ├── LeaderboardRow.tsx
│   │   ├── ChallengeRulesBadge.tsx
│   │   ├── ActivityCard.tsx
│   │   └── StravaConnectBanner.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLeaderboard.ts
│   │   └── useActivities.ts
│   └── utils/
│       ├── formatters.ts     — formatPace(sec), formatDistance(m), formatDuration(sec)
│       └── storage.ts        — MMKV wrapper
├── app.json                  — scheme: "runningapp"
├── .env
└── package.json
```

## Coding Conventions

### Backend
- TypeScript strict mode bật
- Mỗi route handler phải được wrap với try/catch hoặc dùng `asyncHandler`
- Không để raw `console.log` — dùng `logger.ts`
- Tất cả body/query params phải qua Zod validation trước khi dùng
- Controllers chỉ xử lý HTTP layer, logic nghiệp vụ nằm trong services
- Prisma client import từ `config/db.ts`, không tạo instance mới

### Mobile
- Tất cả API calls đi qua `src/api/client.ts` (không dùng fetch trực tiếp)
- Zustand stores không chứa async logic — async nằm trong hooks hoặc api files
- Navigation types phải được khai báo trong `navigation/types.ts`
- Không hardcode URL — dùng `process.env.EXPO_PUBLIC_API_URL`

## Lệnh thường dùng

### Backend
```bash
cd backend
npm run dev           # ts-node-dev, hot reload
npm run build         # tsc
npm start             # node dist/server.js
npx prisma migrate dev --name <tên>   # tạo migration mới
npx prisma generate   # regenerate Prisma client
npx prisma db seed    # seed admin user
npx prisma studio     # GUI xem database
```

### Mobile
```bash
cd mobile
npx expo start              # start dev server (cùng mạng LAN)
npx expo start --tunnel     # start dev server (khác mạng, dùng ngrok)
npx expo run:android        # build + chạy trên device/emulator
```

### Build APK (EAS Build — không cần PC, chạy độc lập)
```bash
npm install -g eas-cli      # cài EAS CLI (1 lần)
eas login                   # login Expo account
cd mobile
eas build:configure         # cấu hình (1 lần, chọn Android)
eas build --platform android --profile preview   # build APK trên cloud (~10-15 phút)
```
- Sau khi build xong EAS gửi link tải APK, cài thẳng lên Android
- APK gọi thẳng Railway, không cần PC đang chạy
- Cần có tài khoản tại expo.dev

## Deploy

- **Backend**: push lên GitHub → Railway tự build và deploy
  - Build command: `npm run build && npx prisma migrate deploy`
  - Start command: `npm start`
- **Database**: Supabase, copy Connection URI vào `DATABASE_URL` trên Railway

## Admin

- Chỉ có 1 admin duy nhất, được tạo qua `npx prisma db seed`
- Seed đọc `ADMIN_EMAIL` và `ADMIN_PASSWORD` từ `.env`
- Field `isAdmin` trong bảng `User` — không bao giờ set qua API register
- JWT payload chứa `{ sub: userId, isAdmin: boolean }` — mobile đọc `isAdmin` từ đây để hiện/ẩn Admin tab
