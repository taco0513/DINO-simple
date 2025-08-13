# 🌍 DINO - Digital Nomad Visa Tracker

디지털 노마드를 위한 비자 추적 애플리케이션입니다. 여러 나라의 비자 사용 현황을 실시간으로 추적하고 관리할 수 있습니다.

**🌐 Live Service**: [dinoapp.net](https://dinoapp.net)

## 🚀 주요 기능

- **🔐 사용자 인증**: Supabase 인증을 통한 안전한 로그인/회원가입
- **📊 비자 상태 추적**: 각 국가별 비자 사용일수와 남은 기간 실시간 확인
- **✈️ 체류 기록 관리**: 입/출국 기록 자동 관리 및 오버랩 해결
- **🗺 여행 경로 추적**: 출발지와 도착지 정보를 포함한 상세한 여행 기록
- **📱 모바일 반응형**: 모든 디바이스에서 최적화된 사용자 경험
- **☁️ 클라우드 동기화**: 데이터가 클라우드에 안전하게 저장되어 어디서든 접근 가능

## 🛠 기술 스택

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database & Authentication)
- **Deployment**: Vercel (dinoapp.net)
- **State Management**: Zustand

## 🚀 로컬 개발 환경 설정

### 1. 프로젝트 클론 및 설치

```bash
git clone https://github.com/taco0513/DINO-simple.git
cd DINO-simple
npm install
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 파일의 내용 실행
3. Authentication > Settings에서:
   - Enable email confirmations (선택사항)
   - Enable social providers (Google, GitHub 등)

### 3. 환경 변수 설정

`.env.local` 파일 생성 후 다음 정보 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속

## 📁 프로젝트 구조

```
DINO-simple/
├── app/
│   ├── dashboard/        # 대시보드 페이지
│   ├── globals.css      # 글로벌 스타일
│   ├── layout.tsx       # 루트 레이아웃
│   └── page.tsx         # 홈페이지 (대시보드로 리다이렉트)
├── components/
│   ├── AddStayModal.tsx # 체류 기록 추가 모달
│   ├── CountrySelect.tsx # 검색 가능한 국가 선택 드롭다운
│   ├── EditStayModal.tsx # 체류 기록 수정 모달
│   ├── Sidebar.tsx      # 사이드바 네비게이션
│   ├── StaysList.tsx    # 체류 기록 목록
│   └── VisaCard.tsx     # 비자 상태 카드
├── lib/
│   ├── countries.ts     # 국가 데이터
│   ├── store.ts        # Zustand 상태 관리
│   ├── types.ts        # TypeScript 타입 정의
│   ├── visa-calculator.ts # 비자 계산 로직
│   └── visa-rules.ts   # 비자 규칙 데이터
└── package.json
```

## ✨ 주요 기능

- 🌍 **다중 국가 비자 추적**: 여러 국가의 비자 상태를 한눈에 확인
- 📊 **자동 계산**: 체류 일수 자동 계산 및 남은 일수 표시
- 🚨 **상태 표시**: 안전(초록), 주의(노랑), 위험(빨강) 색상 표시
- 💾 **로컬 저장**: 브라우저 localStorage를 사용한 데이터 저장
- 📱 **반응형 디자인**: 모바일과 데스크톱 모두 지원
- ✏️ **체류 기록 관리**: 추가, 수정, 삭제 기능
- 🔍 **검색 가능한 국가 선택**: 타이핑으로 국가 검색 가능
- 🎯 **특별 비자 지원**: 한국 183/365 특별 거주 비자 지원

## 🛠 기술 스택

- **Next.js 15**: React 프레임워크
- **TypeScript**: 타입 안정성
- **Tailwind CSS**: 스타일링
- **Zustand**: 상태 관리
- **date-fns**: 날짜 계산

## 📝 사용법

### 체류 기록 추가
1. **기록 추가**: "체류 기록 추가" 버튼 클릭 또는 "Add Your First Stay"
2. **국가 선택**: 드롭다운 클릭 후 국가명 타이핑으로 검색 가능
3. **날짜 입력**: 입국일과 출국일 입력 (출국일은 선택사항)
4. **비자 타입 선택**: 
   - Visa Free (무비자)
   - Tourist Visa (관광비자)
   - Business Visa (비즈니스비자)
   - E-Visa (전자비자)
   - 183/365 (한국 특별 거주 - 한국 선택시만 표시)
5. **저장**: 자동으로 비자 상태 계산 및 표시

### 체류 기록 관리
- **수정**: 체류 기록 목록에서 "수정" 버튼 클릭
- **삭제**: 체류 기록 목록에서 "삭제" 버튼 클릭 (확인 필요)

## 🎯 비자 규칙

미국 여권 기준 주요 국가 비자 규칙:
- 🇰🇷 한국: 
  - 일반: 90일 (재입국시 리셋)
  - 특별 거주 (183/365): 365일 중 183일 (Rolling window)
- 🇯🇵 일본: 180일 중 90일 (Rolling window)
- 🇹🇭 태국: 60일 (2024년 7월부터, 재입국시 리셋)
- 🇻🇳 베트남: 90일 (E-visa 기준, 재입국시 리셋)
- 🇸🇬 싱가포르: 90일 (재입국시 리셋)
- 🇲🇾 말레이시아: 90일 (재입국시 리셋)
- 🇵🇭 필리핀: 30일 (재입국시 리셋)
- 🇮🇩 인도네시아: 30일 (재입국시 리셋)
- 🇹🇼 대만: 90일 (재입국시 리셋)
- 🇭🇰 홍콩: 90일 (재입국시 리셋)
- 🇪🇺 쉥겐: 180일 중 90일 (Rolling window)
- 🇬🇧 영국: 365일 중 180일 (Rolling window)
- 🇨🇦 캐나다: 365일 중 180일 (Rolling window)
- 🇲🇽 멕시코: 180일 (재입국시 리셋)
- 🇦🇺 호주: 90일 (재입국시 리셋)
- 🇳🇿 뉴질랜드: 90일 (재입국시 리셋)

## 📌 참고사항

- 데이터는 브라우저 localStorage에 저장됩니다
- 비자 규칙은 미국 여권 기준입니다
- 2024년 업데이트된 최신 비자 정보 반영
- 특별 비자 케이스는 개별 설정 가능

## 🔄 최근 업데이트

### 2025-08-13
- ✅ 베트남 비자 정보 업데이트 (45일 → 90일 E-visa)
- ✅ 태국 비자 정보 업데이트 (30일 → 60일, 2024년 7월부터)
- ✅ 한국 특별 거주 비자 옵션 추가 (183/365)
- ✅ 국가 리스트 알파벳 순서로 정렬
- ✅ 검색 가능한 국가 선택 드롭다운 구현
- ✅ 체류 기록 수정 및 삭제 기능 추가

## 🚧 계획된 기능

- [ ] 다크 모드 지원
- [ ] 비자 만료 알림
- [ ] 데이터 내보내기/가져오기
- [ ] 여행 통계 대시보드
- [ ] 다중 여권 지원
