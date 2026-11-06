# Orca -> Adehone 리브랜딩 및 빌드/배포 가이드

본 문서는 Orca 프로젝트를 **Adehone**로 리브랜딩하고, 개발 실행 및 macOS 배포 패키지(.dmg/.app)를 빌드할 때 수정한 내역, 원격 최신 main 동기화 내역, 그리고 트러블슈팅 노하우를 정리한 가이드입니다.

---

## 0. 변경 이력 (Change Log)

| 버전     | 날짜       | 작업 내역                                                                                                              |
| :------- | :--------- | :--------------------------------------------------------------------------------------------------------------------- |
| **v1.3** | 2026-11-06 | `Developer ID Application` 인증서 연동 및 macOS `.app` 번들과 `.dmg` 디스크 이미지 자동 코드 서명 봉인 파이프라인 구축 |
| **v1.2** | 2026-11-06 | 원격 `origin/main` 최신 288개 커밋 병합 (`25d677f7ad4`), 다국어(`en.json`) 신규 기능 키 충돌 해결 및 머지 완료         |
| **v1.1** | 2026-11-06 | Adehone 신규 브랜드 아이덴티티(무한대 루프 로고/아이콘) 전면 반영 및 Pretendard 기본 UI 폰트 시스템 구축               |
| **v1.0** | 2026-11-05 | Orca -> Adehone 기본 명칭 리브랜딩, macOS 로컬 코드서명 봉인 및 패키징 스크립트 트러블슈팅                             |

---

## 1. 변경 파일 목록 및 상세 내역

### 1.1 설정 및 패키징 메타데이터

- [`package.json`](file:///Users/cdchoi/Documents/git/orca/package.json)
  - `bin` 항목에 `adehone`, `adehone-dev` 추가 (`orca`, `orca-dev`와 병행 지원)
- [`config/electron-builder.config.cjs`](file:///Users/cdchoi/Documents/git/orca/config/electron-builder.config.cjs)
  - `productName: 'Adehone'` 설정
  - DMG 산출물 이름: `dmg.artifactName: 'adehone-macos-${arch}.${ext}'`
  - `findInstalledMacSigningIdentity`: 로컬 빌드 시 키체인 인증서 자동 검색 및 배포 전용(`Developer ID Application`) / 개발용(`Apple Development`) 우선순위 처리
  - `afterPack`: 로컬 비공증 빌드 시 수천 개 정적 에셋의 타임스탬프 원격 요청 지연을 방지하기 위해 `--timestamp=none` 적용 및 최상위 `Adehone.app` 번들 서명 봉인 보장

### 1.2 Electron 메인 프로세스 및 시스템 메뉴

- [`src/main/startup/dev-instance-identity.ts`](file:///Users/cdchoi/Documents/git/orca/src/main/startup/dev-instance-identity.ts)
  - `BASE_APP_NAME = 'Adehone'`로 변경하여 앱 기본 명칭을 Adehone로 등록
- [`src/main/window/createMainWindow.ts`](file:///Users/cdchoi/Documents/git/orca/src/main/window/createMainWindow.ts)
  - 메인 윈도우 기본 타이틀 `title: opts?.title ?? 'Adehone'`로 설정
- [`src/main/menu/register-app-menu.ts`](file:///Users/cdchoi/Documents/git/orca/src/main/menu/register-app-menu.ts)
  - macOS 시스템 메뉴 항목 리브랜딩:
    - `About Adehone Dev`
    - `Hide Adehone Dev`, `Quit Adehone Dev`
    - `Explore Adehone`, `Getting Started with Adehone`
    - `Show Adehone Mobile Button`
- [`src/main/menu/register-app-menu.test.ts`](file:///Users/cdchoi/Documents/git/orca/src/main/menu/register-app-menu.test.ts)
  - 시스템 메뉴 단위 테스트 라벨 기대값 동기화 (`Explore Adehone` 등)
- [`src/main/menu/app-menu-quit-item.ts`](file:///Users/cdchoi/Documents/git/orca/src/main/menu/app-menu-quit-item.ts)
  - 종료 메뉴 및 툴팁 텍스트 내 `Adehone` 반영
- [`src/main/window/main-window-close-lifecycle.ts`](file:///Users/cdchoi/Documents/git/orca/src/main/window/main-window-close-lifecycle.ts)
  - 트레이 닫기 및 백그라운드 전환 알림 내 `Adehone` 반영

### 1.3 렌더러 (UI 컴포넌트)

- [`src/renderer/index.html`](file:///Users/cdchoi/Documents/git/orca/src/renderer/index.html)
  - 브라우저/웹뷰 기본 문서 타이틀 `<title>Adehone</title>`
- [`src/renderer/src/app-shell/TitlebarLeftControls.tsx`](file:///Users/cdchoi/Documents/git/orca/src/renderer/src/app-shell/TitlebarLeftControls.tsx)
  - 상단 타이틀바 앱 이름 텍스트 `'Adehone'`
- [`src/renderer/src/components/Landing.tsx`](file:///Users/cdchoi/Documents/git/orca/src/renderer/src/components/Landing.tsx)
  - 첫 화면 랜딩 페이지 대제목 `'ADEHONE'`, 로고 alt 텍스트 `'Adehone logo'`
- [`src/renderer/src/components/sidebar/SidebarSettingsHelpMenu.tsx`](file:///Users/cdchoi/Documents/git/orca/src/renderer/src/components/sidebar/SidebarSettingsHelpMenu.tsx)
  - 사이드바 설정/도움말 메뉴 항목 `'Restart Adehone'` 및 토스트 안내 문구 반영

### 1.4 다국어 번역 파일 (`i18n`)

- [`src/renderer/src/i18n/locales/`](file:///Users/cdchoi/Documents/git/orca/src/renderer/src/i18n/locales/) (총 11개 언어)
  - 대상 파일: `ko.json`, `en.json`, `ja.json`, `zh.json`, `zh-Hant.json`, `de.json`, `es.json`, `fr.json`, `pt.json`, `ru.json`, `tr.json`
  - 약 1,300여 건의 UI 표시 텍스트 `"Orca"` -> `"Adehone"` 치환
  - **원격 최신 병합 동기화 (`en.json`)**: 원격 최신 변경으로 추가된 신규 기능 키(`macFullDiskAccess`, `serverReplaced*`, `setupFreeHostSpace`, `setupStopUnmanagedRuntime`, `setupSeeDetails` 등)를 누락 없이 모두 수용하되 문구 내 브랜드명을 `Adehone`으로 일관되게 적용
  - **주의**: 내부 딥링크 스킴(`orca://`) 및 고유 프로토콜은 시스템 호환성을 위해 그대로 보존

### 1.5 CLI 및 개발 스크립트

- [`src/cli/root-help-text-primary.ts`](file:///Users/cdchoi/Documents/git/orca/src/cli/root-help-text-primary.ts)
  - 터미널 CLI 도움말 텍스트 내 `Adehone` 반영
- [`config/scripts/dev-electron-bundle-identity.mjs`](file:///Users/cdchoi/Documents/git/orca/config/scripts/dev-electron-bundle-identity.mjs)
  - `DEV_BUNDLE_DISPLAY_NAME = 'Adehone Dev'`
- [`config/scripts/run-electron-vite-dev.mjs`](file:///Users/cdchoi/Documents/git/orca/config/scripts/run-electron-vite-dev.mjs)
  - 개발 모드 실행 시 macOS Dock 타이틀 `Adehone` 반영
- [`config/scripts/desktop-distribution/macos/build-mac-local.mjs`](file:///Users/cdchoi/Documents/git/orca/config/scripts/desktop-distribution/macos/build-mac-local.mjs)
  - 단일 아키텍처 지정(`--arm64` 등) 인자 처리, `CSC_IDENTITY_AUTO_DISCOVERY: 'false'` 기본 적용 및 패키징 완료 후 `dist/*.dmg` 파일에 대한 `Developer ID Application` 자동 서명 봉인 처리

### 1.6 로고 및 앱 아이콘 에셋 (Adehone Brand Identity)

- [`resources/logo.svg`](file:///Users/cdchoi/Documents/git/orca/resources/logo.svg), [`resources/icon-source/icon.icon/Assets/logo.svg`](file:///Users/cdchoi/Documents/git/orca/resources/icon-source/icon.icon/Assets/logo.svg)
  - Adehone `AH` 무한대 루프(Infinity Loop) 그라데이션 심볼 마크 벡터 SVG 적용
- [`resources/build/icon.icns`](file:///Users/cdchoi/Documents/git/orca/resources/build/icon.icns), [`resources/build/icon.png`](file:///Users/cdchoi/Documents/git/orca/resources/build/icon.png), [`resources/build/icon.ico`](file:///Users/cdchoi/Documents/git/orca/resources/build/icon.ico)
  - macOS(`.icns`, `16x16`~`512x512@2x` 전체 슬롯), Linux/Fallback(`1024x1024` `.png`), Windows(멀티 사이즈 `.ico`) 패키징용 Adehone 앱 아이콘 적용
- [`resources/icon.png`](file:///Users/cdchoi/Documents/git/orca/resources/icon.png), [`resources/icon-dev.png`](file:///Users/cdchoi/Documents/git/orca/resources/icon-dev.png), [`resources/app-icons/orca-blue.png`](file:///Users/cdchoi/Documents/git/orca/resources/app-icons/orca-blue.png), [`resources/app-icons/orca-watercolor.png`](file:///Users/cdchoi/Documents/git/orca/resources/app-icons/orca-watercolor.png)
  - 런타임/개발 모드 기본 아이콘 및 설정 > 외관(Appearance) 앱 아이콘 프리셋(다크 네이비 / 라이트 아이보리) 반영
- [`resources/tray/orca-menu-barTemplate.png`](file:///Users/cdchoi/Documents/git/orca/resources/tray/orca-menu-barTemplate.png), [`resources/tray/orca-menu-barTemplate@2x.png`](file:///Users/cdchoi/Documents/git/orca/resources/tray/orca-menu-barTemplate@2x.png)
  - macOS 상단 메뉴바 트레이용 Adehone 모노크롬 템플릿 아이콘(`22x14`, `44x28`) 반영
- [`src/renderer/src/components/Landing.tsx`](file:///Users/cdchoi/Documents/git/orca/src/renderer/src/components/Landing.tsx), [`src/renderer/src/components/onboarding/OnboardingFlow.tsx`](file:///Users/cdchoi/Documents/git/orca/resources/logo.svg), [`src/renderer/src/components/settings/page/orca-logo-settings-icon.tsx`](file:///Users/cdchoi/Documents/git/orca/src/renderer/src/components/settings/page/orca-logo-settings-icon.tsx)
  - 랜딩 배지 네이비 라디얼 그라데이션 배경 적용 및 라이트/다크 모드 색상 반전(`invert`) 제거로 원본 브랜드 그라데이션 유지

### 1.7 기본 UI 폰트 (Pretendard)

- [`src/renderer/src/assets/fonts/PretendardVariable.woff2`](file:///Users/cdchoi/Documents/git/orca/src/renderer/src/assets/fonts/PretendardVariable.woff2)
  - Pretendard Variable 웹 폰트(woff2) 파일 추가
- [`src/renderer/src/assets/main.css`](file:///Users/cdchoi/Documents/git/orca/src/renderer/src/assets/main.css)
  - `Pretendard Variable` 및 `Pretendard` `@font-face` 등록
  - `:root`의 `--app-font-family` 기본값 1순위를 `'Pretendard'`로 지정
- [`src/shared/constants.ts`](file:///Users/cdchoi/Documents/git/orca/src/shared/constants.ts)
  - `DEFAULT_APP_FONT_FAMILY = 'Pretendard'`로 변경하여 앱 신규 설치 및 기본 설정 시 Pretendard가 기본 적용되도록 구성
- [`src/renderer/src/lib/app-font-family.ts`](file:///Users/cdchoi/Documents/git/orca/src/renderer/src/lib/app-font-family.ts)
  - 폰트 fallback 체계에 `Pretendard`, `Pretendard Variable`, `Geist` 등을 배치하여 사용자가 다른 폰트로 변경하더라도 글리프 누락 없이 매끄럽게 연결되도록 처리
- [`src/renderer/src/components/settings/appearance/fonts/font-suggestions.ts`](file:///Users/cdchoi/Documents/git/orca/src/renderer/src/components/settings/appearance/fonts/font-suggestions.ts)
  - 설정 > 외관(Appearance) > IDE Font 드롭다운 추천 목록에 `Pretendard`, `Geist`, `Inter`, `SF Pro Text` 등 인기 UI 폰트 추가 제공 (원하는 폰트명 직접 입력 및 변경 가능)

---

## 2. 주의사항 (변경하지 말아야 할 항목)

리브랜딩 시 모든 문자열을 무조건 치환하면 빌드 및 런타임이 깨질 수 있으므로 다음 항목들은 `orca`로 유지해야 합니다:

1. **딥링크 프로토콜**: `orca://` 스킴
2. **IPC 채널명 및 통신 소켓 파일**: 시스템 내부 프로세스 간 통신 네임스페이스
3. **사용자 설정 저장 경로**: `~/.orca/` 디렉터리 구조 및 키체인 내부 저장소 키
4. **리눅스/WSL 데몬 바이너리 및 서비스 명칭**: `orcad` (Orca Daemon)

---

## 3. 개발 환경 빌드 & 실행 방법

### 3.1 사전 필수 구성

1. **pnpm 설치 확인**:
   `pnpm`이 Node 스크립트로 동작할 경우 자식 프로세스 실행 시 `ENOEXEC`가 발생할 수 있으므로, 래퍼 스크립트를 사용합니다.
   ```bash
   cat << 'EOF' > ~/.local/bin/pnpm
   #!/bin/sh
   exec node /Users/cdchoi/.cache/node/corepack/v1/pnpm/12.14.0/bin/pnpm.mjs "$@"
   EOF
   chmod +x ~/.local/bin/pnpm
   ```
2. **모바일 웹 의존성 설치**:
   ```bash
   pnpm -C mobile install
   ```
3. **Swift 컴파일러 링크 확인**:
   macOS 네이티브 모듈 빌드를 위해 Xcode 기본 Swift(Apple Swift 6.4+)가 사용되도록 설정합니다.

### 3.2 개발 모드 실행

```bash
pnpm dev
```

- `out/electron-dev/.../Adehone: main.app` 형태로 실행되며, 독(Dock)과 창 타이틀, 메뉴가 Adehone로 표시됩니다.

### 3.3 CLI 빌드

```bash
pnpm run build:cli
```

- `adehone` 및 `adehone-dev` 명령어가 생성됩니다.

---

## 4. macOS 배포 패키지 (.dmg / .app) 빌드

### 4.1 빌드 명령어

사내 프록시 CA 또는 자체 서명 환경인 경우 `NODE_TLS_REJECT_UNAUTHORIZED=0`을 함께 부여합니다:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 node config/scripts/desktop-distribution/macos/build-mac-local.mjs
```

### 4.2 생성되는 산출물 경로

- DMG 파일: `dist/adehone-macos-arm64.dmg`
- ZIP 파일: `dist/Adehone-1.4.214-local.*-arm64-mac.zip`
- 앱 번들: `dist/mac-arm64/Adehone.app`

---

## 5. 배포 시 "손상된 앱" Gatekeeper 해결 가이드

### 5.1 원인

1. **서명 미봉인 (해결됨)**: 이전에는 내부와 외부 서명 체계가 어긋나 `code has no resources but signature indicates they must be present` 에러가 났으나, 현재는 `Apple Development` 인증서로 완전 봉인되어 무결성 검증(`codesign --verify --deep --strict`)을 통과합니다.
2. **macOS 격리 속성 (`com.apple.quarantine`)**: 인터넷(슬랙, 카카오톡, 크롬 등)으로 다운로드한 파일은 Apple 공증(Notarization) 티켓이 없으면 Apple Silicon Mac에서 기본적으로 실행을 차단하고 "손상되었습니다" 팝업을 띄웁니다.

### 5.2 해결 방법

#### [방법 A] 받는 사람이 터미널에서 격리 속성 제거 (가장 간편함)

앱을 `/Applications`에 넣은 후 터미널에서 다음 명령어를 실행합니다:

```bash
xattr -cr /Applications/Adehone.app
```

_(DMG 파일 자체에 대해 실행하려면 `xattr -cr ~/Downloads/adehone-macos-arm64.dmg`)_

#### [방법 B] macOS 시스템 설정에서 허용

1. 앱 실행 시도 후 차단 창에서 [완료] 클릭
2. **시스템 설정 > 개인정보 보호 및 보안** 맨 아래로 이동
3. **`"Adehone"이(가) 차단되었습니다` 옆의 [여전히 열기]** 클릭

#### [방법 C] 정식 Apple Notarization (더블클릭 즉시 실행용)

1. **Xcode > Settings > Accounts > Manage Certificates...**에서 `+`를 눌러 **`Developer ID Application`** 인증서 발급
2. [account.apple.com](https://account.apple.com)에서 앱 암호(App-Specific Password) 생성
3. 공증 자격증명 등록:
   ```bash
   xcrun notarytool store-credentials "adehone-notary" \
     --apple-id "<애플ID 이메일>" \
     --team-id "3YK2K2L99A" \
     --password "<발급받은 앱 암호>"
   ```
4. `ORCA_MAC_RELEASE=1` 플래그로 릴리스 빌드 실행 시 Apple 서버 공증 및 티켓 스테이플링이 자동으로 완료됩니다.

---

## 6. 원격 최신 코드(Upstream) 동기화 및 충돌 해결 가이드

원격 `origin/main`의 최신 커밋들을 동기화할 때 로컬 커스텀 설정(Adehone 리브랜딩, 로고 에셋, Pretendard 폰트)을 안전하게 유지하는 표준 절차입니다:

### 6.1 동기화 작업 흐름

1. **작업 브랜치 백업**:
   ```bash
   git checkout -b feature/adehone-rebrand
   git add .
   git commit -m "feat: Adehone 리브랜딩, 브랜드 로고/아이콘 및 Pretendard 폰트 적용"
   ```
2. **원격 최신 커밋 Fetch 및 main 브랜치 이동**:
   ```bash
   git fetch origin main
   git checkout main
   git merge --ff-only origin/main
   ```
3. **로컬 커스텀 브랜치 병합**:
   ```bash
   git merge feature/adehone-rebrand
   ```

### 6.2 충돌(Conflict) 해결 원칙

- **기본 원칙**: 불일치 발생 시 로컬에서 수정한 내용(`Adehone` 브랜딩/폰트/에셋)이 최우선권을 가집니다.
- **원격 신규 기능/키 반영**: 원격에서 새롭게 추가된 기능 키나 필수 로직(예: `en.json`의 신규 에러 안내 문구 등)은 절대 누락시키지 않고 모두 수용하되, 해당 문구 내 `Orca` 명칭을 `Adehone`으로 변경하여 병합합니다.
- **검증 필수 단계**:
  ```bash
  # 1. 서식 및 린트 검증
  pnpm exec oxfmt --write <수정된 파일>
  pnpm exec oxlint <수정된 파일>

  # 2. 타입체크
  pnpm tc

  # 3. 단위 테스트
  pnpm test src/renderer/src/lib/app-font-family.test.ts src/main/menu/register-app-menu.test.ts --maxWorkers=2
  ```
- **커밋 메시지 규칙 준수**:
  ```text
  feat: 원격 main 최신 변경사항 병합 및 Adehone 브랜드/폰트 설정 반영

  refs: main
  ```
