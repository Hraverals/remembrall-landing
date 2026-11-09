<!--
기술 문서 본문. 빌드 때 plugins/doc-pages.ts 가 HTML 로 바꿔 tech-spec.html 에 넣는다.
- "## 제목 {#id}" 가 목차 항목이 된다. ## 에는 {#id} 가 꼭 있어야 한다.
- 팀 레포 파일 링크는 [이름](<repo:경로>) 로 쓴다. develop 브랜치 주소로 바뀌고 한글 · 공백은 인코딩된다.
- 문서 말투는 "~다" 체. 숫자는 출처 문서의 값 그대로 쓰고 출처를 링크한다.
- 번호 목록(1.)은 흐름 단계로 그려진다. 첫 줄 **굵은 글씨**가 단계 제목, <small>근거: …</small> 는 작은 글씨 줄이다.
- 설정값은 코드 기본값이다. 운영 환경 변수로 바뀔 수 있으니 "기본값"이라고 밝힌다.
-->

## 개요 {#overview}

REMEMBRALL은 YouTube Shorts에서 저장만 해 두고 잊은 장소를, 그 장소 근처에 갔을 때 알림으로 다시 꺼내 주는 Android 앱이다.

해결하려는 문제는 세 가지다.

- Shorts에서 장소를 발견해도 실제 방문으로 이어지지 않는다.
- 저장한 콘텐츠가 쌓이기만 하고 다시 확인하지 않는다.
- 사용자가 장소명과 위치를 직접 정리해야 한다.

MVP 범위는 Shorts 지원, 영상에서 장소 추출, 실제 장소와 좌표 검증, 장소 기반 트리거, 사용자의 위치와 조건이 맞을 때 알림이다. 일정 기반 트리거와 Instagram은 제외한다.

<small>근거: [카테켐프로젝트 개요](<repo:docs/카테켐프로젝트 개요.md>) · [eas.json](repo:frontend/eas.json)(빌드 프로필이 Android만 있다)</small>

## 시스템 구조 {#architecture}

앱이 서버에 요청을 보내고, 서버가 저장 파이프라인과 꺼내기 에이전트를 함께 돌린다. 꺼내기 에이전트는 별도 서비스가 아니라 서버 안의 모듈(recall 패키지)이다. 도착 보고를 받은 서버는 꺼내기 실행을 끝까지 처리한 뒤 202를 돌려주고, 결과는 FCM 알림으로 보낸다.

<figure class="doc-arch">
<div class="doc-arch__core">
<div class="doc-arch__box">
<p class="doc-arch__name">앱</p>
<p class="doc-arch__meta">Android · Expo · React Native</p>
<ul class="doc-arch__list"><li>Shorts 공유 받기</li><li>저장 목록 · 지도 · 상세</li><li>지오펜스 등록 · 도착 보고</li><li>알림 받기</li></ul>
</div>
<div class="doc-arch__link" aria-hidden="true"><span class="doc-arch__arrow doc-arch__arrow--fwd">REST 요청</span><span class="doc-arch__arrow doc-arch__arrow--back">FCM 알림</span></div>
<div class="doc-arch__box">
<p class="doc-arch__name">서버</p>
<p class="doc-arch__meta">Java 21 · Spring Boot 4.1</p>
<ul class="doc-arch__list"><li>저장 파이프라인</li><li>꺼내기 에이전트(Spring AI)</li><li>지오펜스 목록 · 알림</li><li>인증 · 동의</li></ul>
</div>
<div class="doc-arch__link" aria-hidden="true"><span class="doc-arch__arrow doc-arch__arrow--both">JPA · SQL</span></div>
<div class="doc-arch__box">
<p class="doc-arch__name">DB</p>
<p class="doc-arch__meta">PostgreSQL · pgvector</p>
<ul class="doc-arch__list"><li>회원 · 콘텐츠 · 장소</li><li>트리거 · 꺼내기 실행 · 알림</li><li>요약 임베딩(768차원)</li></ul>
</div>
</div>
<p class="doc-arch__drop" aria-hidden="true"><span class="doc-arch__arrow doc-arch__arrow--down">서버가 부르는 외부 API</span></p>
<div class="doc-arch__groups">
<div class="doc-arch__group">
<p class="doc-arch__group-title">저장에 쓰는 것</p>
<ul class="doc-arch__list"><li>YouTube Data API</li><li>Gemini — 영상 분석 · 요약 임베딩</li><li>LocationIQ · VWorld · TourAPI</li><li>소상공인 상가정보 · 지방행정 인허가</li><li>카카오 로컬 — 장소 ID만</li></ul>
</div>
<div class="doc-arch__group">
<p class="doc-arch__group-title">꺼내기에 쓰는 것</p>
<ul class="doc-arch__list"><li>Gemini — 꺼내기 판단 · 검색어 임베딩</li><li>기상청 단기예보</li><li>FCM — 알림 전송</li></ul>
</div>
</div>
<figcaption>앱은 서버에 REST로 요청하고, 꺼내기 결과는 FCM 알림으로 받는다. 서버는 DB와 외부 API를 쓴다. 외부 API는 저장 흐름에 쓰는 것과 꺼내기 흐름에 쓰는 것으로 나눴다.</figcaption>
</figure>

<small>근거: [ADR001 선택한 기술](repo:backend/docs/ADR/ADR001_선택한기술.md) · [LocationEventController](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/controller/LocationEventController.java)(202 Accepted) · [recall 패키지](https://github.com/kakaotechcampus-4/ktc4-chungnam-3/tree/develop/backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall)</small>

### 구성

| 구분 | 기술                                                                                                                                                                                                                                               | 근거                                                                                                                                                              |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 앱   | Expo SDK 57, React Native 0.86, TypeScript, React Navigation 7, react-native-maps(Google 지도), @gorhom/bottom-sheet, expo-location · expo-task-manager(지오펜스), expo-notifications(FCM 토큰 · 알림), expo-share-intent(공유 받기), Reanimated 4 | [package.json](repo:frontend/package.json) · [MapViewScreen](repo:frontend/src/features/map-view/MapViewScreen.tsx)                                               |
| 서버 | Java 21, Spring Boot 4.1, Spring Security, Spring Data JPA, Flyway, Spring AI 2.0.1(Google GenAI · pgvector), firebase-admin                                                                                                                       | [build.gradle](repo:backend/Remembrall/build.gradle)                                                                                                              |
| DB   | PostgreSQL. 콘텐츠 요약 임베딩은 pgvector(`vector` 확장)에 둔다.                                                                                                                                                                                   | [V11 마이그레이션](repo:backend/Remembrall/src/main/resources/db/migration/V11__add_content_embedding.sql) · [ADR001](repo:backend/docs/ADR/ADR001_선택한기술.md) |

### 외부 연동

| 연동                        | 쓰는 곳       | 하는 일                                                                               | 근거                                                                                                                                                                                                                                                                              |
| --------------------------- | ------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| YouTube Data API            | 저장          | 제목 · 설명 · 태그 · 게시일, 채널 주인이 쓴 댓글                                      | [YoutubeMetadataClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/youtube/YoutubeMetadataClient.java)                                                                                                                                               |
| Gemini                      | 저장          | 영상 분석(`gemini-3.8-flash`)                                                         | [VideoContentAnalyzer](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/analysis/VideoContentAnalyzer.java)                                                                                                                                                |
| Gemini 임베딩               | 저장 · 꺼내기 | 요약 임베딩과 꺼내기 검색어 임베딩(`gemini-embedding-001`, 768차원)                   | [VertexEmbeddingClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/content/embedding/VertexEmbeddingClient.java) · [RecallToolService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/tool/RecallToolService.java)             |
| LocationIQ                  | 저장          | 장소 이름 검색(좌표 · 주소)                                                           | [PlaceSearchClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/PlaceSearchClient.java)                                                                                                                                                         |
| VWorld                      | 저장          | 프랜차이즈 지점의 기준점 좌표. 응답은 저장하지 않는다.                                | [VWorldSearchClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/VWorldSearchClient.java)                                                                                                                                                       |
| 한국관광공사 TourAPI        | 저장          | 지점명 없는 관광지의 이름 일치 검색                                                   | [TourApiClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/TourApiClient.java)                                                                                                                                                                 |
| 소상공인 상가정보           | 저장          | 좌표 반경 안 업소 이름 대조                                                           | [DataportalStoreClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/DataportalStoreClient.java)                                                                                                                                                 |
| 지방행정 인허가(행정안전부) | 저장          | 일반 · 휴게음식점 데이터. 매일 변경분을 DB에 적재해 상가정보와 함께 반경 대조에 쓴다. | [LocalDataStoreLookup](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/LocalDataStoreLookup.java) · [BusinessLicenseSyncScheduler](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/BusinessLicenseSyncScheduler.java) |
| 카카오 로컬                 | 저장          | 확정한 좌표의 카카오 장소 ID 확인. ID 외의 값은 저장하지 않는다.                      | [KakaoPlaceClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/KakaoPlaceClient.java)                                                                                                                                                           |
| Gemini                      | 꺼내기        | 꺼내기 판단(기본 모델 `gemini-3.6-flash`)                                             | [LlmRecallAgent](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/agent/LlmRecallAgent.java) · [application.yaml](repo:backend/Remembrall/src/main/resources/application.yaml)                                                                           |
| 기상청 단기예보             | 꺼내기        | 방문 조건 확인 도구의 날씨                                                            | [KmaWeatherClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/weather/KmaWeatherClient.java)                                                                                                                                                       |
| FCM                         | 꺼내기        | 알림 전송                                                                             | [FirebasePushSender](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/notification/push/FirebasePushSender.java)                                                                                                                                                |

## 저장 흐름 {#save-flow}

사용자가 Shorts를 REMEMBRALL로 공유하면 앱이 주소를 서버에 보내고, 서버가 영상을 분석해 장소를 찾는다. 장소 하나를 확정하지 못하면 후보를 보여 주고 사용자에게 묻는다(되묻기).

1. **공유 받기**
   앱은 공유된 주소 중 `youtube.com/shorts/{11자 id}` 형식만 받는다. 추적 파라미터를 버리고 `https://www.youtube.com/shorts/{id}`로 서버에 보낸다.
   <small>근거: [youtube.ts](repo:frontend/src/runtime/share/supportedLinks/youtube.ts) · [personalSaves.ts](repo:frontend/src/shared/api/personalSaves.ts)</small>

2. **저장 접수**
   서버는 주소에서 videoId를 뽑아 콘텐츠를 찾거나 만들고, 회원의 저장을 연결한다. 같은 영상은 콘텐츠 하나를 함께 쓴다. 분석 전 상태이거나 이전 분석이 외부 호출 오류로 실패한 경우에만 분석을 새로 시작한다. 분석은 응답을 보낸 뒤 별도 작업 스레드에서 돈다(동시 2개, 기본값).
   <small>근거: [PersonalSaveService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/personalsave/service/PersonalSaveService.java) · [ContentPersistenceService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/content/service/ContentPersistenceService.java) · [ContentRepository](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/repository/ContentRepository.java) · [PersonalSaveAnalysisService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/personalsave/service/PersonalSaveAnalysisService.java)</small>

3. **메타데이터**
   YouTube Data API로 제목 · 설명 · 태그 · 게시일을 받고, 관련도 순 댓글 50개 중 채널 주인이 쓴 댓글을 고른다.
   <small>근거: [YoutubeMetadataClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/youtube/YoutubeMetadataClient.java)</small>

4. **영상 분석**
   Gemini(`gemini-3.8-flash`)에 영상과 메타데이터를 함께 넘겨 요약 · 카테고리 · 장소 후보(상호 · 지점 · 지역) · 기간 정보를 정해진 JSON 스키마로 받는다. 좌표는 이 단계에서 뽑지 않는다.
   <small>근거: [VideoContentAnalyzer](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/analysis/VideoContentAnalyzer.java)</small>

5. **장소 찾기**
   장소 후보마다 따로 찾는다. 지점명이 있으면 VWorld 또는 LocationIQ로 기준점을 잡고, 그 주변의 공공 상가정보 · 지방행정 인허가 업소에서 상호가 맞는 곳을 찾는다. 지점명이 없으면 TourAPI 관광지 이름 일치, 지역 상가 데이터 순으로 찾는다. 여기서 못 찾으면 LocationIQ 검색 결과를 이름 · 종류 · 시도로 거르고, 100m 안의 중복 등록을 하나로 합친다.
   <small>근거: [PlaceResolver](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/PlaceResolver.java) · [PlaceSearchClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/PlaceSearchClient.java) · [VWorldSearchClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/VWorldSearchClient.java) · [TourApiClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/TourApiClient.java) · [CompositeNearbyStoreLookup](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/CompositeNearbyStoreLookup.java)</small>

6. **판정**
   남은 후보가 1곳이면 확정한다. 단, 지점명이 다르거나 반경 100m 안 상가 이름과 맞지 않으면 되묻는다. 2~3곳이면 되묻되, 지점명 교차검증으로 한 곳으로 좁혀지면 확정한다. 0곳이거나 4곳 이상이면 장소 없음으로 본다.
   <small>근거: [PlaceResolver](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/PlaceResolver.java)(`MAX_CONFIRMATION_CANDIDATES = 3`, `NEARBY_STORE_RADIUS_METERS = 100`)</small>

7. **카카오 확인**
   확정된 장소는 그 좌표 주변을 카카오 로컬로 검색해 브랜드가 맞는 장소 ID를 받는다. 못 받으면 장소 없음으로 본다. 되묻기 후보도 보여 주기 전에 미리 확인해, 통과하지 못한 후보는 뺀다. 카카오 응답에서 장소 ID 외의 값은 저장하지 않는다.
   <small>근거: [SavePipelineService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/SavePipelineService.java)(`verifyWithKakao` · `preverifyConfirmation`) · [KakaoPlaceClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/KakaoPlaceClient.java)</small>

8. **저장**
   제목 · 요약 · 카테고리를 묶은 글을 `gemini-embedding-001`로 768차원 임베딩해 콘텐츠와 함께 저장하고, 확정 장소마다 장소와 회원별 트리거를 만든다. 되묻기 후보는 따로 저장해 두고, 사용자가 고르면 장소를 더한다.
   <small>근거: [ContentAnalysisResultService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/content/service/ContentAnalysisResultService.java) · [ContentPersistenceService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/content/service/ContentPersistenceService.java) · [ConfirmAnswerService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/confirm/ConfirmAnswerService.java) · [ADR004 요약 임베딩](<repo:backend/docs/ADR/ADR004_컨텐츠 요약 임베딩 구현 결정.md>)</small>

## 꺼내기 흐름 {#recall-flow}

앱은 저장한 장소 주변에 OS 지오펜스를 걸어 두고, 장소에 들어가면 서버에 도착을 알린다. 서버는 지금 알릴지를 꺼내기 에이전트에게 판단하게 하고, 알리기로 하면 FCM으로 알림을 보낸다.

1. **목록 받기**
   앱은 로그인, 위치 권한 "항상 허용", 위치 정보 이용 동의가 모두 있을 때 현재 위치를 보내 지오펜스 목록을 받는다. 로그인 직후, 앱이 앞으로 돌아올 때, 위치 설정이 바뀔 때, 재조회 지오펜스를 벗어날 때 다시 받는다.
   <small>근거: [useGeofenceSync.ts](repo:frontend/src/app/useGeofenceSync.ts) · [geofenceSync.ts](repo:frontend/src/runtime/geofence/geofenceSync.ts)</small>

2. **서버가 고르는 목록**
   서버는 회원의 트리거 장소 중 최근 7일(기본값) 안에 제안한 장소를 빼고, 현재 위치에서 가까운 순으로 플랫폼 한도에서 한 자리를 뺀 만큼(Android 한도 100, 기본값) 골라 반경 150m(기본값) 지오펜스로 준다. 재조회 지오펜스 하나를 함께 주는데, 중심은 현재 위치이고 반경은 가장 먼 장소까지의 거리에 500m를 더한 값(최소 3km, 기본값)이다.
   <small>근거: [GeofenceService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/geofence/service/GeofenceService.java) · [ADR003 지오펜스](repo:backend/docs/ADR/ADR003_지오펜스.md)</small>

3. **OS 등록**
   장소 지오펜스는 들어옴 · 나감을, 재조회 지오펜스는 나감만 OS에 등록한다. 장소에 들어오면 도착을 보고하고, 나가면 앱 안의 상태만 되돌린다.
   <small>근거: [registrationPlan.ts](repo:frontend/src/runtime/geofence/registrationPlan.ts) · [geofenceManager.ts](repo:frontend/src/runtime/geofence/geofenceManager.ts)</small>

4. **도착 보고**
   앱은 이벤트 id(`triggerEventId`)를 새로 만들어 보낸다. 실패하면 대기열에 남겨 같은 id로 다시 보내고, 30분이 지난 보고는 버린다. 도착 보고에는 좌표를 넣지 않고, 도착한 장소의 id와 이벤트 id · 종류 · 시각만 보낸다(서버 API는 좌표를 선택 값으로 받는다).
   <small>근거: [geofenceManager.ts](repo:frontend/src/runtime/geofence/geofenceManager.ts) · [LocationEventRequest](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/dto/LocationEventRequest.java)</small>

5. **실행 전 확인**
   서버는 그 장소의 트리거가 없을 때, 이벤트가 30분(기본값)보다 오래됐을 때, 최근 2시간(기본값) 안에 이 회원의 꺼내기 실행이 있었을 때, 위치 동의가 철회됐을 때, 최근 7일(기본값) 안에 제안한 장소일 때는 실행하지 않는다. 같은 이벤트는 한 번만 실행하고, 실패한 실행만 1번(기본값) 다시 실행한다.
   <small>근거: [LocationEventService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/service/LocationEventService.java) · [RecallExecutionRepository](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/repository/RecallExecutionRepository.java)</small>

6. **에이전트 판단**
   서버는 도착한 장소 주변(기본 1km)의 개인 · 공용 후보와 의미가 비슷한 콘텐츠를 모아 에이전트에 넘긴다. 에이전트는 Spring AI로 Gemini(기본 모델 `gemini-3.6-flash`)를 부르고, 도구 `checkVisitConditions`(운영 조건 · 최근 알림 · 날씨 확인)와 `searchCandidates`(대안 찾기)를 실행당 최대 6번(기본값) 쓴 뒤 PROPOSE 또는 NO_ACTION을 낸다. 실행 시간 제한은 90초(기본값)다. 에이전트 모드는 설정 `recall.agent.mode`로 고르고, 코드 기본값 `stub`은 항상 NO_ACTION을 내는 시험용이다.
   <small>근거: [RecallAgentInputService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/service/RecallAgentInputService.java) · [LlmRecallAgent](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/agent/LlmRecallAgent.java) · [RecallAgentSession](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/agent/RecallAgentSession.java) · [RecallToolBinding](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/tool/RecallToolBinding.java) · [RecallConfiguration](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/config/RecallConfiguration.java) · [StubRecallAgent](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/agent/StubRecallAgent.java) · [ADR005 Spring AI](<repo:backend/docs/ADR/ADR005_꺼내기 에이전트에 Spring AI 채택.md>)</small>

7. **알림**
   PROPOSE면 서버가 제안을 검증한 뒤 알림을 저장하고 FCM으로 보낸다. Android 알림 채널은 `nearby`이고 중요도는 default다(헤드업 없음).
   <small>근거: [RecallExecutionService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/service/RecallExecutionService.java) · [ProposalValidator](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/service/ProposalValidator.java) · [FirebasePushSender](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/notification/push/FirebasePushSender.java) · [channels.ts](repo:frontend/src/runtime/notifications/channels.ts) · [STRUCTURE.md](repo:frontend/STRUCTURE.md)</small>

8. **상세 열기**
   알림을 누르면 저장물 상세가 열린다. 근처에서 연 상세는 바랜 사진이 원래 색으로 풀린다.
   <small>근거: [notificationOpener.ts](repo:frontend/src/app/notifications/notificationOpener.ts) · [ContentDetailScreen](repo:frontend/src/features/content-detail/ContentDetailScreen.tsx) · [savedPlaceSheet.ts](repo:frontend/src/features/content-detail/savedPlaceSheet.ts)</small>

### 꺼내기 기본 설정값

| 설정                                  | 기본값 | 뜻                                         |
| ------------------------------------- | ------ | ------------------------------------------ |
| `recall.member-cooldown`              | 2h     | 회원별 꺼내기 실행 사이 최소 간격          |
| `recall.tools.recent-proposal-window` | 7d     | 최근 제안한 장소를 빼는 기간               |
| `recall.max-event-age`                | 30m    | 이보다 오래된 도착 보고는 실행하지 않는다  |
| `recall.max-event-retries`            | 1      | 실패한 실행을 다시 실행하는 횟수           |
| `recall.agent.max-tool-calls`         | 6      | 실행 한 번에 쓸 수 있는 도구 호출 수       |
| `recall.agent.execution-timeout`      | 90s    | 에이전트 실행 시간 제한                    |
| `recall.candidates.radius-meters`     | 1000   | 에이전트에 넘길 후보를 모으는 반경(m)      |
| `geofence.place-radius-meters`        | 150    | 장소 지오펜스 반경(m)                      |
| `geofence.android-limit`              | 100    | Android 지오펜스 한도(재조회용 1자리 포함) |

운영 환경 변수로 바뀔 수 있다. <small>근거: [application.yaml](repo:backend/Remembrall/src/main/resources/application.yaml)</small>

## 에이전트 평가 {#agent-eval}

작성 중이다.

## 데이터 · 인증 {#data-auth}

작성 중이다.

## 품질 · CI {#quality}

작성 중이다.

## 배포 {#deploy}

작성 중이다.

## 개인정보 · 보안 {#privacy}

작성 중이다.

## 디자인 시스템 {#design-system}

작성 중이다.

## 한계와 다음 단계 {#next}

작성 중이다.

## 더 읽을 문서 {#references}

작성 중이다.
