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

꺼내기 에이전트는 골든셋 장면을 격리된 PostgreSQL에 넣고, 실제 후보 준비 · 임베딩 · 에이전트 모델(`gemini-3.6-flash`)로 실행해 평가했다. 아래 숫자는 모두 [에이전트 평가 결과](<repo:backend/docs/에이전트 평가 결과.md>) 문서의 값이다.

### 채점 방식

- 채점은 별도 모델(엘리스 OpenAI 호환 엔드포인트의 `anthropic/claude-sonnet-5-5`, 온도 0)이 [에이전트 평가 기준](<repo:backend/docs/에이전트 평가 기준.md>) 문서로 한다.
- 필수 조건을 어기거나 서버 검증에 실패하면 BAD(1점), 위반이 없고 기대한 선택과 같으면 GOOD(5점), 그 밖은 ACCEPTABLE(3점)이다.
- 에이전트 실패와 채점 실패는 품질 점수에서 빼고 신뢰성 지표로 따로 센다.
- 날씨는 평가에서 장면마다 고정값을 주는 가짜 클라이언트를 쓴다.

필수 조건은 일곱 가지다. 받은 후보만 쓴다 / 콘텐츠와 장소를 바르게 잇는다 / 확인되지 않은 사실을 단정하지 않는다 / 사용자 상황을 지어내지 않는다 / 제안 형태의 제약을 지킨다 / 방문 불가 정보와 모순되는 제안을 하지 않는다 / 공용 후보의 저장 관계를 드러내지 않는다.

<small>근거: [에이전트 평가 결과](<repo:backend/docs/에이전트 평가 결과.md>) · [에이전트 평가 기준](<repo:backend/docs/에이전트 평가 기준.md>) · [Judge README](repo:backend/Remembrall/src/test/resources/recall/evaluation/judge/README.md)</small>

### 버전별 변경

| 버전 | 바꾼 것                                                                                                       |
| ---- | ------------------------------------------------------------------------------------------------------------- |
| v1   | 기본 판단 기준 프롬프트, 도구 없음                                                                            |
| v2   | 후보 검색, 상세 조회, 거리 조회 도구 연결. 프롬프트는 id 규칙과 도구 안내만 변경                              |
| v3   | 요약 속 운영 기간과 휴무를 이벤트 날짜와 비교하는 문단, 사용자 상태를 단정하지 않는 문단 추가                 |
| v4   | 도구를 방문 조건 확인과 대안 검색 둘로 교체. 잠정 제안, 확인, 대안, 최종 제안의 흐름과 책임을 프롬프트에 명시 |

v4의 두 도구는 지금 코드의 `checkVisitConditions` · `searchCandidates`다.
<small>근거: [TOOL_EVALUATION.md](repo:backend/Remembrall/src/test/resources/recall/evaluation/TOOL_EVALUATION.md) · [RecallToolBinding](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/tool/RecallToolBinding.java)</small>

### 회귀 세트 tune

기존 골든셋 tune 24장면을 3회씩, 72건.

| 실행         | BAD | 에이전트 실패 | GOOD / ACCEPTABLE | 품질 평균 | 시간 중앙값 | 시간 p95 | 실행당 토큰 | 도구를 쓴 실행 |
| ------------ | --: | ------------: | ----------------: | --------: | ----------: | -------: | ----------: | -------------: |
| v1 도구 OFF  |   5 |          1.4% |           46 / 20 |     4.155 |      7.66초 |  14.58초 |       1,840 |             0% |
| v2 도구 ON   |   4 |            0% |           47 / 21 |     4.194 |      8.12초 |  11.80초 |       3,971 |            53% |
| v3 도구 ON   |   1 |            0% |           45 / 26 |     4.222 |      8.28초 |  12.99초 |       4,069 |            50% |
| v3 도구 OFF  |   0 |            0% |           47 / 25 |     4.306 |      6.97초 |   9.63초 |       2,033 |             0% |
| v4 확인 중심 |   0 |          1.4% |           48 / 23 |     4.352 |      8.61초 |  11.25초 |       6,513 |            94% |

v4의 에이전트 실패 1건은 모델이 JSON 앞뒤에 백틱을 붙여 변환에 실패한 것이다. 이후 응답 파싱을 보강했고, 그 뒤 실행에서는 같은 실패가 없었다.

### 회귀 세트 holdout

튜닝 중 보지 않은 6장면을 1회씩.

| 실행         | BAD | GOOD |
| ------------ | --: | ---: |
| v3 도구 ON   |   0 |    6 |
| v3 도구 OFF  |   0 |    6 |
| v4 확인 중심 |   0 |    6 |

### 도구 세트

방문 조건 확인과 대안 검색의 결과가 판단을 바꿔야 하는 18장면을 3회씩, 54건. v4에서만 실행했다.

| 항목              |          결과 |
| ----------------- | ------------: |
| BAD               |             0 |
| 에이전트 실패     |             0 |
| GOOD / ACCEPTABLE |        49 / 5 |
| 확인 호출률       | 42 / 42, 100% |
| 검색 호출률       |    3 / 9, 33% |
| 불필요 호출률     |    8 / 9, 89% |
| 시간 중앙값       |        9.26초 |
| 시간 p95          |       14.32초 |
| 실행당 토큰       |         8,877 |

조건 하나만 바꾼 쌍에서 판단이 갈렸는지 본 결과다.

| 쌍                               | 왼쪽 선택     | 오른쪽 선택   | 판단이 갈린 반복 |
| -------------------------------- | ------------- | ------------- | ---------------: |
| 산책로, 맑음과 비                | 산책로와 카페 | 실내 카페     |            3 / 3 |
| 야외 루프탑, 맑음과 비           | 루프탑        | 실내 카페     |            3 / 3 |
| 빵집, 오늘 휴무와 다른 날 휴무   | 브런치만      | 브런치와 빵집 |            3 / 3 |
| 전시, 진행 중과 종료             | 전시와 카페   | 카페만        |            3 / 3 |
| 최근 제안, 안 열어봄과 이력 없음 | 다른 카페     | 원래 카페     |            3 / 3 |
| 식당, 첫 입력 밖에 있음과 없음   | 카페만        | 카페만        |            0 / 3 |

### 확인한 것

- BAD를 5건에서 0건으로 줄인 주된 변화는 도구가 아니라 v3의 운영 기간과 휴무 확인 문단이었다.
- 첫 입력에 이미 있는 정보를 더 보여 주는 v2의 도구는 판단을 바꾸지 못했고 토큰만 두 배로 늘렸다.
- 서버가 첫 입력에 줄 수 없는 정보(날씨, 저장 설명 전체의 휴무와 운영 기간, 최근 제안 반응)를 주는 v4의 도구는 쌍 6개 중 5개에서 판단을 바꿨다.
- 그래서 v4 확인 중심 도구를 켜기로 했다.

문서가 정한 MVP 완결 기준 5개(회귀 tune · holdout · 도구 세트 · 비용 기록 · 결과 기록)를 모두 통과했다. <small>근거: [에이전트 평가 결과 · MVP 완결 기준 판정](<repo:backend/docs/에이전트 평가 결과.md>)</small>

### 영상 분석 평가셋

저장 쪽 영상 분석은 별도 평가셋으로 확인했다. 2026-10-06 1차 실행에서 영상 10개, 추출 44건이 모두 상호 · 지점까지 맞았고(A), 놓친 장소는 없었다. 첫 시도 성공은 8/10이고, 재시도 후 10/10이다.
<small>근거: [평가셋.md](repo:AI/평가셋.md)</small>

## 데이터 · 인증 {#data-auth}

데이터는 회원 → 개인 저장 → 콘텐츠 ⇄ 장소 ← 트리거 → 꺼내기 실행 → 알림으로 이어진다. 콘텐츠는 영상 하나에 하나이고 여러 회원의 저장이 함께 쓴다. 트리거는 회원과 장소의 쌍이다.

| 엔티티                             | 핵심 제약                                                   | 관계 · 내용                                                          |
| ---------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| 회원 `member`                      | `(auth_provider, provider_user_id)` UNIQUE                  | 기기 하나, 개인 저장 · 트리거 · 동의 여러 개                         |
| 기기 `device`                      | `member_id` · 세션 해시 · FCM 토큰 각각 UNIQUE              | 회원당 하나. 세션 해시 · 만료 시각 · FCM 토큰                        |
| 개인 저장 `personal_save`          | `(member_id, content_id)` UNIQUE                            | 회원이 콘텐츠를 저장한 기록                                          |
| 콘텐츠 `content`                   | `video_id` UNIQUE                                           | 영상 하나에 하나. 제목 · 요약 · 카테고리 · 요약 임베딩 `vector(768)` |
| 콘텐츠 · 장소 `content_place`      | `(content_id, place_id)` UNIQUE                             | 콘텐츠와 장소의 다대다 연결                                          |
| 장소 `place`                       | `verification_provider` · `verification_place_id` 쌍 UNIQUE | 카카오 장소 ID로 같은 장소를 구분한다                                |
| 트리거 `trigger`                   | `(member_id, place_id)` UNIQUE                              | 회원 × 장소. 지오펜스와 꺼내기의 기준                                |
| 꺼내기 실행 `recall_execution`     | `(trigger_id, trigger_event_id)` UNIQUE                     | 도착 이벤트 하나의 실행. 실행 과정은 trace 테이블에 남는다           |
| 알림 `notification`                | `execution_id` UNIQUE                                       | 실행마다 최대 하나                                                   |
| 회원 동의 `member_consent`         | `(member_id, consent_type)` 유효한 것 UNIQUE                | 위치기반서비스 · 공용 후보 기여 동의와 약관 버전                     |
| 되묻기 후보 `confirm_candidate`    | `(content_id, candidate_id)` UNIQUE                         | 사용자에게 물을 장소 후보                                            |
| 지방행정 인허가 `business_license` | `source_id` UNIQUE                                          | 장소 반경 대조용 업소 데이터(다른 테이블과 연결 없음)                |

<small>근거: 엔티티 문서 [Member](repo:backend/docs/엔티티/Member.md) · [PersonalSave](repo:backend/docs/엔티티/PersonalSave.md) · [Content](repo:backend/docs/엔티티/Content.md) · [ContentPlace](repo:backend/docs/엔티티/ContentPlace.md) · [Place](repo:backend/docs/엔티티/Place.md) · [Trigger](repo:backend/docs/엔티티/Trigger.md) · [RecallExecution](repo:backend/docs/엔티티/RecallExecution.md) · [Notification](repo:backend/docs/엔티티/Notification.md), 마이그레이션 [V1](repo:backend/Remembrall/src/main/resources/db/migration/V1__create_member_and_device.sql) · [V2](repo:backend/Remembrall/src/main/resources/db/migration/V2__replace_refresh_token_with_session.sql) · [V3](repo:backend/Remembrall/src/main/resources/db/migration/V3__add_unique_fcm_token.sql) · [V4](repo:backend/Remembrall/src/main/resources/db/migration/V4__create_content_and_personal_save.sql) · [V6](repo:backend/Remembrall/src/main/resources/db/migration/V6__create_place_and_content_place.sql) · [V7](repo:backend/Remembrall/src/main/resources/db/migration/V7__create_trigger.sql) · [V9](repo:backend/Remembrall/src/main/resources/db/migration/V9__scope_recall_event_uniqueness_to_trigger.sql) · [V10](repo:backend/Remembrall/src/main/resources/db/migration/V10__create_notification.sql) · [V11](repo:backend/Remembrall/src/main/resources/db/migration/V11__add_content_embedding.sql) · [V12](repo:backend/Remembrall/src/main/resources/db/migration/V12__create_member_consent.sql) · [V13](repo:backend/Remembrall/src/main/resources/db/migration/V13__create_business_license.sql) · [V17](repo:backend/Remembrall/src/main/resources/db/migration/V17__create_recall_execution_trace.sql) · [V18](repo:backend/Remembrall/src/main/resources/db/migration/V18__create_confirm_candidate.sql)</small>

### 인증

1. **게스트로 시작**
   앱은 처음 실행할 때 무작위 설치 id(UUID v4)를 만들어 안전한 저장소에 두고, `POST /api/auth/guest`로 세션을 받는다. 서버는 설치 id를 해시해 회원을 찾거나 만든다.
   <small>근거: [guest.ts](repo:frontend/src/shared/auth/guest.ts) · [AuthService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/auth/service/AuthService.java)</small>

2. **불투명 세션 토큰**
   서버는 32바이트 난수 토큰을 주고, DB에는 SHA-256 해시만 저장한다. API 요청은 `Authorization: Bearer`로 보내고, 세션 만료는 30일(기본값)이다. JWT와 리프레시 토큰은 쓰지 않는다.
   <small>근거: [ADR002 인증 방식 변경](<repo:backend/docs/ADR/ADR002_인증 방식 변경 - JWT 폐기 및 DB 불투명 세션 전환.md>) · [SessionTokenGenerator](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/auth/token/SessionTokenGenerator.java) · [SessionTokenHasher](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/auth/token/SessionTokenHasher.java) · [SessionAuthenticationFilter](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/auth/security/SessionAuthenticationFilter.java)</small>

3. **회원당 기기 하나**
   회원마다 기기 행이 하나라서, 다시 로그인하면 새 세션이 이전 세션을 대체한다.
   <small>근거: [V1](repo:backend/Remembrall/src/main/resources/db/migration/V1__create_member_and_device.sql)(`uk_device_member`) · [AuthService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/auth/service/AuthService.java) · [STRUCTURE.md](repo:frontend/STRUCTURE.md)</small>

4. **카카오 로그인**
   서버에 구현돼 있다. 카카오 액세스 토큰을 `access_token_info`로 확인하고, 응답의 `app_id`가 서버 설정과 같을 때만 받는다. 앱에서는 꺼져 있다.
   <small>근거: [KakaoUserClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/auth/kakao/KakaoUserClient.java) · [providers.ts](repo:frontend/src/shared/auth/providers.ts)(`enabled: false`)</small>

## 품질 · CI {#quality}

Backend CI는 develop 대상 PR과 develop push에서 돈다. 아래 다섯 검사가 모두 성공해야 통과한다.

| 검사                    | 하는 일                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| Backend build           | Java 21과 저장소의 Gradle Wrapper로 테스트 코드 컴파일 · 실행 JAR 생성                    |
| Backend JUnit           | `test` 태스크 전체 실행. `live` 태그는 제외                                               |
| Bruno API regression    | 빌드한 JAR와 임시 PostgreSQL/pgvector로 `test/bruno`의 기본 회귀 폴더 실행                |
| Bruno seeded regression | 테스트 전용 백엔드 · 합성 데이터 · 외부 연동 대역으로 컬렉션 4개를 두 번 실행             |
| Backend delivery tools  | 외부 gate 보호 · 관찰 테스트, GHCR pull 배포기의 상태 전이 · 복구 검사, Compose 설정 검사 |

CI는 실제 API 키 대신 무효한 고정 값을 쓰고, 꺼내기 에이전트는 stub 모드로 돈다. 실제 외부 연동은 CI에서 검증하지 않고, 꺼내기 에이전트의 판단 품질은 별도 평가(5장)로 본다.
<small>근거: [CI.md](repo:test/CI.md) · [backend-ci.yml](repo:.github/workflows/backend-ci.yml)</small>

### Bruno 컬렉션

| 컬렉션                                 | 실행             | 검증하는 것                                                    |
| -------------------------------------- | ---------------- | -------------------------------------------------------------- |
| `test/bruno`                           | CI · 기본 회귀   | 인증 · 동의 · 기기 · 위치 이벤트 · 알림 · 저장 기본 흐름       |
| `bruno-place-list`                     | CI · 합성 데이터 | 장소 목록의 출처 · 회원 격리 · 공통 장소 · 삭제 반영           |
| `bruno-auth-device`                    | CI · 합성 데이터 | FCM 토큰 저장 · 이전, 세션 만료 · 재발급 · 로그아웃, 약관 버전 |
| `bruno-analysis-lifecycle`             | CI · 합성 데이터 | 분석 실패 · 재시도 · 분석 중 삭제 · 멈춤 복구                  |
| `bruno-recall-retry`                   | CI · 합성 데이터 | 꺼내기 재시도 한도 · 중복 방지 · 발송 실패                     |
| `bruno-recall` · `bruno-recall-policy` | 수동 · 실제 연동 | 실제 장소 이벤트와 알림 생성, 위치 이벤트 차단 정책            |
| `bruno-save-list` · `bruno-confirm`    | 수동 · 실제 연동 | 저장 목록 페이지네이션, 장소 후보 답변                         |
| `bruno-live` · `bruno-geofence`        | 수동 · 실제 연동 | 실제 영상 분석, 저장 · 분석 데이터가 필요한 지오펜스           |
| `bruno-external`                       | 배포 gate        | 실제 외부 연동 검사(8장)                                       |

<small>근거: [CI.md](repo:test/CI.md) · [harness/run.sh](repo:test/harness/run.sh) · [test 폴더](https://github.com/kakaotechcampus-4/ktc4-chungnam-3/tree/develop/test)</small>

### 앱

앱에는 `lint`(expo lint)와 `format:check`(Prettier) 스크립트가 있다. 앱용 CI 워크플로는 없다.
<small>근거: [package.json](repo:frontend/package.json) · [frontend README](repo:frontend/README.md) · [워크플로 폴더](https://github.com/kakaotechcampus-4/ktc4-chungnam-3/tree/develop/.github/workflows)</small>

## 배포 {#deploy}

### 서버

서버는 GitHub에서 검사한 이미지를 GHCR에 올리고, 서버의 배포기가 그 이미지를 가져가는 방식이다. GitHub에 SSH 키를 두지 않는다.

1. **CI 재사용**
   main에 push하면 Backend release 워크플로가 같은 커밋으로 Backend CI 다섯 검사를 다시 돌린다.
   <small>근거: [backend-release.yml](repo:.github/workflows/backend-release.yml)</small>

2. **실제 외부 API gate**
   빈 일회용 DB에서 실제 영상 분석 · 임베딩 · LLM 호출을 확인한다.
   <small>근거: [backend-release.yml](repo:.github/workflows/backend-release.yml) · [container README](repo:.github/container/README.md)</small>

3. **ARM64 이미지와 GHCR 게시**
   검증한 같은 JAR로 ARM64 이미지를 만들고, 일회용 DB로 기동을 확인한 뒤 GHCR에 게시한다.
   <small>근거: [container README](repo:.github/container/README.md)</small>

4. **서버가 가져가기**
   서버의 배포기가 1분마다 GHCR의 `deploy-main` 채널을 확인하고, 새 이미지가 있으면 가져와 교체한다. 진행 중인 분석 · 알림이 있으면 미루고, 점검(503) → pg_dump 백업 → 새 컨테이너 → 내부 · 외부 health 확인 순으로 바꾼다. 실패하면 이전 버전으로 되돌린다.
   <small>근거: [container README](repo:.github/container/README.md) · [remembrall-pull.timer](repo:.github/container/remembrall-pull.timer)</small>

배포는 두 스위치가 모두 켜져야 돈다. GitHub 쪽 `BACKEND_DEPLOY_ENABLED`가 채널 갱신을, 서버 설정의 `enabled`와 timer가 실제 적용을 정한다. 이미지 게시가 곧 운영 배포는 아니다.
<small>근거: [container README](repo:.github/container/README.md)</small>

### 앱

EAS 빌드 프로필은 development · preview · preview-mock · production이다. development와 preview(이를 물려받는 preview-mock 포함)는 APK를 만든다. preview는 설정 화면에 시연 도구를 켜고(`EXPO_PUBLIC_DEMO_TOOLS=1`), preview-mock은 서버 · FCM 없이 목 데이터로 시연하는 백업 APK다(`EXPO_PUBLIC_FORCE_MOCK=1`).

배포 APK는 팀 레포 [Release v1.0.0](https://github.com/kakaotechcampus-4/ktc4-chungnam-3/releases/tag/v1.0.0)의 `remembrall.apk`다. preview 프로필로 빌드했고 실서버에 연결한다(팀 확인).
<small>근거: [eas.json](repo:frontend/eas.json) · [demoTools.ts](repo:frontend/src/shared/demo/demoTools.ts) · [frontend README](repo:frontend/README.md)(시연 백업용 preview-mock) · [Release v1.0.0](https://github.com/kakaotechcampus-4/ktc4-chungnam-3/releases/tag/v1.0.0)</small>

### 랜딩

이 사이트는 Cloudflare Pages로 배포한다. 랜딩 레포의 `landing/` 폴더를 main push 때 빌드한다.
<small>근거: [랜딩 README](https://github.com/Hraverals/remembrall-landing/blob/main/landing/README.md)</small>

## 개인정보 · 보안 {#privacy}

- **위치 정보 이용 동의**: OS 위치 권한과 따로 받는다. 동의하지 않았으면 위치 허용 화면이 동의 시트를 먼저 띄우고, 동의를 기록한 뒤에 권한을 요청한다. 동의 기록은 권한 결과와 무관하다. 동의할 때 서버의 현재 약관 버전을 함께 보내고, 약관이 바뀌면 다시 묻는다. 설정에서 동의를 거둘 수 있다.
  <small>근거: [LocationPermissionScreen](repo:frontend/src/features/onboarding/LocationPermissionScreen.tsx) · [WithdrawConsentSheet](repo:frontend/src/features/settings/components/WithdrawConsentSheet.tsx) · [MemberConsentController](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/consent/controller/MemberConsentController.java)</small>
- **동의가 없으면**: 서버는 지오펜스 목록을 비워 주고, 도착 보고도 실행하지 않는다.
  <small>근거: [GeofenceService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/geofence/service/GeofenceService.java) · [LocationEventService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/recall/service/LocationEventService.java)</small>
- **위치를 보내는 때**: 앱이 서버에 좌표를 보내는 것은 지오펜스 목록을 받을 때뿐이다. 도착 보고에는 장소 id와 이벤트 id · 종류 · 시각만 보낸다.
  <small>근거: [geofences.ts](repo:frontend/src/shared/api/geofences.ts) · [geofenceManager.ts](repo:frontend/src/runtime/geofence/geofenceManager.ts)</small>
- **공용 후보**: 꺼내기의 공용 후보에는 공용 후보 기여 동의가 유효한 회원의 저장만 쓴다. 에이전트는 공용 후보를 다른 사람이 저장했다는 사실을 말하지 않는다(평가 기준 7번).
  <small>근거: [PublicCandidateRepository](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/repository/PublicCandidateRepository.java) · [에이전트 평가 기준](<repo:backend/docs/에이전트 평가 기준.md>)</small>
- **저장하지 않는 것**: 영상 · 음성 · 전체 자막은 저장하지 않는다. 콘텐츠에는 videoId · 제목 · 요약 · 카테고리와 요약 임베딩을 둔다. 외부 장소 데이터는 약관에 맞춰 일부만 저장한다. 카카오는 장소 ID만 저장하고, VWorld 응답은 저장하지 않는다.
  <small>근거: [카테켐프로젝트 개요](<repo:docs/카테켐프로젝트 개요.md>) · [V4](repo:backend/Remembrall/src/main/resources/db/migration/V4__create_content_and_personal_save.sql) · [KakaoPlaceClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/KakaoPlaceClient.java) · [VWorldSearchClient](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/save/place/VWorldSearchClient.java)</small>
- **세션과 설치 id**: 세션 토큰은 DB에 해시로만 둔다. 앱은 세션과 설치 id를 `expo-secure-store`(Android Keystore)에 둔다.
  <small>근거: [SessionTokenHasher](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/auth/token/SessionTokenHasher.java) · [STRUCTURE.md](repo:frontend/STRUCTURE.md) · [guest.ts](repo:frontend/src/shared/auth/guest.ts)</small>
- **키 관리**: 운영 서버의 API 키와 Firebase 인증 파일은 서버에만 두고 컨테이너에 읽기 전용으로 연결한다. 이미지에는 넣지 않는다. 배포 전 실제 연동 검사의 키는 GitHub `external-api` Environment Secret에 둔다. CI는 무효한 고정 값을 쓴다.
  <small>근거: [container README](repo:.github/container/README.md) · [CI.md](repo:test/CI.md)</small>

## 디자인 시스템 {#design-system}

디자인 컨셉은 "바랜 기억"이다. 저장한 지 오래될수록 사진 위에 바탕색(`bg/fade`)을 덮어 바래게 한다. 저장 후 7일 미만은 0%, 30일 미만은 30%, 그 이상은 50%다. 근처에서 연 상세(알림 · 근처 탭의 "지금" 카드)는 장소를 원래 색으로 그리고, 썸네일이 저장 시각만큼 바랜 상태에서 600ms 동안 원래 색으로 풀린다.
<small>근거: [savedAt.ts](repo:frontend/src/shared/ui/savedAt.ts)(`fadeFor`) · [fade.ts](repo:frontend/src/shared/ui/theme/fade.ts) · [Thumb.tsx](repo:frontend/src/shared/ui/Thumb.tsx) · [metrics.ts](repo:frontend/src/shared/ui/theme/metrics.ts)(`restoreDurationMs`) · [ContentDetailScreen](repo:frontend/src/features/content-detail/ContentDetailScreen.tsx) · [savedPlaceSheet.ts](repo:frontend/src/features/content-detail/savedPlaceSheet.ts)</small>

토큰은 Figma의 `C · Color` · `C · Dimension` 컬렉션과 `C 바랜기억/` 텍스트 스타일을 이름 그대로 코드로 옮긴다. 화면 코드에는 색 · 간격 · radius · 타이포를 리터럴로 쓰지 않는다. 강조 색은 자두색(`brand/primary`) 하나이고, 로그인 제공자 색만 예외다. 색 토큰은 한 벌이다.
<small>근거: [STRUCTURE.md](repo:frontend/STRUCTURE.md)(테마 토큰 · 로그인 제공자) · [colors.ts](repo:frontend/src/shared/ui/theme/colors.ts)</small>

### 색

| 칩                                                                               | 토큰                   | 값        | 쓰임                     |
| -------------------------------------------------------------------------------- | ---------------------- | --------- | ------------------------ |
| <span class="doc-swatch" style="background: var(--bg-screen)"></span>            | `bg/screen`            | `#f6f1ee` | 화면 바탕                |
| <span class="doc-swatch" style="background: var(--bg-surface)"></span>           | `bg/surface`           | `#fffcfa` | 카드 · 시트              |
| <span class="doc-swatch" style="background: var(--bg-subtle)"></span>            | `bg/subtle`            | `#ece4e0` | 보조 면                  |
| <span class="doc-swatch" style="background: var(--border-default)"></span>       | `border/default`       | `#ddd2cd` | 선                       |
| <span class="doc-swatch" style="background: var(--text-primary)"></span>         | `text/primary`         | `#2a2126` | 본문 글자                |
| <span class="doc-swatch" style="background: var(--text-secondary)"></span>       | `text/secondary`       | `#6a5d61` | 보조 글자                |
| <span class="doc-swatch" style="background: var(--brand-primary)"></span>        | `brand/primary`        | `#6b4e7a` | 강조 색(하나)            |
| <span class="doc-swatch" style="background: var(--brand-primary-subtle)"></span> | `brand/primary-subtle` | `#f4eef6` | 강조 색의 옅은 면        |
| <span class="doc-swatch" style="background: var(--bg-fade)"></span>              | `bg/fade`              | `#f6f1ee` | 바램 덮개(바탕색과 같다) |

### 바램

| 칩                                                                                           | 토큰          | 덮개 불투명도 | 저장 후 경과 |
| -------------------------------------------------------------------------------------------- | ------------- | ------------: | ------------ |
| <span class="doc-swatch doc-swatch--photo" style="--swatch-fade: var(--fade-recent)"></span> | `fade/recent` |            0% | 7일 미만     |
| <span class="doc-swatch doc-swatch--photo" style="--swatch-fade: var(--fade-weeks)"></span>  | `fade/weeks`  |           30% | 30일 미만    |
| <span class="doc-swatch doc-swatch--photo" style="--swatch-fade: var(--fade-months)"></span> | `fade/months` |           50% | 30일 이상    |

칩의 색 띠는 사진 대신 쓴 예시이고, 그 위에 `bg/fade`를 표의 불투명도로 덮었다.

### 간격 · radius · 텍스트

| 토큰                                           | 값                        |
| ---------------------------------------------- | ------------------------- |
| `space/xs` · `sm` · `md` · `lg` · `xl` · `xxl` | 4 · 8 · 12 · 20 · 32 · 48 |
| `radius/sm` · `md` · `lg` · `full`             | 6 · 12 · 16 · 999         |

| 텍스트 역할      | 서체             | 크기 / 줄 높이 |
| ---------------- | ---------------- | -------------- |
| `Heading/Screen` | Gowun Dodum      | 22 / 30        |
| `Title/Card`     | Noto Sans KR 500 | 16 / 22        |
| `Body/Default`   | Noto Sans KR 400 | 14 / 22        |
| `Label/Button`   | Noto Sans KR 500 | 14 / 20        |
| `Caption/Meta`   | Noto Sans KR 400 | 12 / 16        |

Gowun Dodum은 고정 문구와 숫자에만 쓰고, 장소명 같은 동적 텍스트에는 쓰지 않는다.
<small>근거: [spacing.ts](repo:frontend/src/shared/ui/theme/spacing.ts) · [radius.ts](repo:frontend/src/shared/ui/theme/radius.ts) · [typography.ts](repo:frontend/src/shared/ui/theme/typography.ts) · [STRUCTURE.md](repo:frontend/STRUCTURE.md)</small>

랜딩 · 발표 데모 · 이 문서도 같은 토큰 값을 쓴다.
<small>근거: [랜딩 tokens.css](https://github.com/Hraverals/remembrall-landing/blob/main/landing/src/styles/tokens.css) · [데모 kit.css](https://github.com/Hraverals/remembrall-landing/blob/main/demo/src/kit/kit.css)</small>

## 한계와 다음 단계 {#next}

### 한계

지금 코드 기준의 상태다.

- **요청 제한**: 서버 코드에 회원당 저장 수나 요청 빈도 제한이 없다.
  <small>근거: [PersonalSaveService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/personalsave/service/PersonalSaveService.java) · [SecurityConfig](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/auth/security/SecurityConfig.java)</small>
- **약관 페이지**: 약관 · 정책 페이지가 아직 없다(앱의 약관 주소가 비어 있다).
  <small>근거: [consentTerms.ts](repo:frontend/src/shared/api/consentTerms.ts)</small>
- **공용 후보 동의**: 앱에 공용 후보 기여 동의 화면이 없어, 앱 회원의 저장은 공용 후보로 쓰이지 않는다.
  <small>근거: [consents.ts](repo:frontend/src/shared/api/consents.ts) · [PublicCandidateRepository](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/repository/PublicCandidateRepository.java)</small>
- **카카오 로그인**: 서버에 구현돼 있지만 앱에서는 꺼져 있다.
  <small>근거: [providers.ts](repo:frontend/src/shared/auth/providers.ts)</small>
- **장소 직접 찾기**: 장소 직접 찾기(02c) 화면은 있지만 저장 · 바꾸기가 서버에 연결되지 않았다(목 데이터).
  <small>근거: [STRUCTURE.md](repo:frontend/STRUCTURE.md) · [PlaceSearchScreen](repo:frontend/src/features/save-result/PlaceSearchScreen.tsx)</small>
- **여러 장소**: 장소가 여러 곳인 저장물은 상세에서 한 장소만 보이고 다른 장소로 넘겨 볼 수 없다. 여러 장소 제안(COURSE) 알림도 첫 장소만 연다.
  <small>근거: [savedPlaceSheet.ts](repo:frontend/src/features/content-detail/savedPlaceSheet.ts) · [STRUCTURE.md](repo:frontend/STRUCTURE.md)</small>
- **상세 주소**: 상세의 주소는 서버 값을 그대로 보여 준다. 되묻기 선택지에서만 주소를 짧게 다듬는다.
  <small>근거: [savedPlaceSheet.ts](repo:frontend/src/features/content-detail/savedPlaceSheet.ts) · [confirmView.ts](repo:frontend/src/features/save-result/confirmView.ts)(`shortAddress`)</small>
- **iOS**: iOS 빌드가 없다(EAS 프로필이 Android만 있다).
  <small>근거: [eas.json](repo:frontend/eas.json)</small>
- **서버 한 대 전제**: 분석 대기열이 서버 메모리에 있어 서버 한 대를 전제한다.
  <small>근거: [PersonalSaveAnalysisService](repo:backend/Remembrall/src/main/java/com/ktc/chungnam3/remembrall/personalsave/service/PersonalSaveAnalysisService.java)</small>
- **배포 중 점검**: 배포는 짧은 점검 시간에 앱을 교체한다. 무중단 · 다중 서버 구성이 아니다.
  <small>근거: [container README](repo:.github/container/README.md)</small>
- **범위 밖**: 일정 기반 트리거와 Instagram은 MVP에서 뺐다.
  <small>근거: [카테켐프로젝트 개요](<repo:docs/카테켐프로젝트 개요.md>)</small>

### 다음 단계

아래는 계획이며 아직 구현하지 않았다.

- 앱에서 카카오 로그인 켜기
- 약관 페이지와 공용 후보 기여 동의 화면
- 장소 직접 찾기(02c) 저장 연결
- 여러 장소 저장물의 상세에서 장소 넘겨 보기
- 상세 주소 다듬기
- 요청 제한(회원당 저장 수 등)
- 일정 기반 트리거
- iOS 빌드

저장 기록을 바탕으로 새 장소를 추천하고 장소 사업자와 제휴 광고를 하는 방향은 발표용 컨셉이다. 앱과 서버에는 구현되지 않았다.
<small>근거: 팀 확인 · [발표 데모](https://github.com/Hraverals/remembrall-landing/tree/main/demo)</small>

## 더 읽을 문서 {#references}

팀 레포 develop 브랜치의 문서다.

### 결정 기록(ADR)

- [ADR001 선택한 기술](repo:backend/docs/ADR/ADR001_선택한기술.md)
- [ADR002 인증 방식 변경 - JWT 폐기 및 DB 불투명 세션 전환](<repo:backend/docs/ADR/ADR002_인증 방식 변경 - JWT 폐기 및 DB 불투명 세션 전환.md>)
- [ADR003 지오펜스](repo:backend/docs/ADR/ADR003_지오펜스.md)
- [ADR004 컨텐츠 요약 임베딩 구현 결정](<repo:backend/docs/ADR/ADR004_컨텐츠 요약 임베딩 구현 결정.md>)
- [ADR005 꺼내기 에이전트에 Spring AI 채택](<repo:backend/docs/ADR/ADR005_꺼내기 에이전트에 Spring AI 채택.md>)

### 구현 결정

- [YouTube URL 정규화](<repo:backend/docs/구현결정/2. YouTube URL 정규화.md>)
- [Gemini 분석](<repo:backend/docs/구현결정/3. Gemini 분석.md>)
- [트리거 생성 삭제의 동시성 처리](<repo:backend/docs/구현결정/4 트리거 생성 삭제의 동시성 처리.md>)
- [지오펜스 이벤트 구현 결정](<repo:backend/docs/구현결정/5 지오펜스 이벤트 구현 결정.md>)
- [에이전트 실행](<repo:backend/docs/구현결정/6. 에이전트 실행.md>)
- [꺼내기 실행 쿨다운](<repo:backend/docs/구현결정/7. 꺼내기 실행 쿨다운.md>)

### 데이터

- 엔티티: [Member](repo:backend/docs/엔티티/Member.md) · [PersonalSave](repo:backend/docs/엔티티/PersonalSave.md) · [Content](repo:backend/docs/엔티티/Content.md) · [ContentPlace](repo:backend/docs/엔티티/ContentPlace.md) · [Place](repo:backend/docs/엔티티/Place.md) · [Trigger](repo:backend/docs/엔티티/Trigger.md) · [RecallExecution](repo:backend/docs/엔티티/RecallExecution.md) · [Notification](repo:backend/docs/엔티티/Notification.md)

### API

- [API 명세](repo:docs/API.md): 컨트롤러 · DTO 기준 API 목록이다. "기존 동기 저장 API" 절의 `POST /api/contents`는 지금 코드에 없다.

### 에이전트 평가

- [에이전트 평가 결과](<repo:backend/docs/에이전트 평가 결과.md>)
- [에이전트 평가 기준](<repo:backend/docs/에이전트 평가 기준.md>)
- [영상 분석 평가셋](repo:AI/평가셋.md)
- [방문 조건 확인 도구 v4](repo:backend/Remembrall/src/test/resources/recall/evaluation/TOOL_EVALUATION.md)
- [Judge 실행과 판정](repo:backend/Remembrall/src/test/resources/recall/evaluation/judge/README.md)

### 앱

- [STRUCTURE.md](repo:frontend/STRUCTURE.md): 앱 구조와 설계 근거
- [frontend README](repo:frontend/README.md): 빌드 · 실행 · 시연 도구

### 품질 · 배포

- [CI 안내](repo:test/CI.md)
- [QA 운영 계획](repo:test/README.md)
- [GHCR 배포](repo:.github/container/README.md)
