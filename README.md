# back-node.js

본 프로젝트는 mvc패턴을 이용하여 유지 보수성을 높이려 하였다.<br>

프로젝트의 규모가 크지 않고 토이 프로젝트로 배포 테스트까지를 목표로 두었다. <br>
때문에 비용 절감을 위해 관리자와 유저의 처리를 한 백서버에서 처리하였다. <br>

데이터의 저장에 있어서 조회가 잦은 특성을 고려하여 메모리 데이터베이스를 적용하였으며<br>
데이터의 중요도와 특성에 따라 MongoDB와 postgreSQL을 혼합 사용하였다.<br>

## 프로젝트 데이터 베이스 스키마

# 2025-01-03 오전 feature/all 수정사항

## 0. index.js :

route 엔드포인트 "/api" 제거

## 1. auth

### config :

config.js의 ftp부분 baseUrl => baseUrl: process.env.FTP_URL === 'http://222.112.27.120/kochiri'

### middlewares :

fileUpload.js에 authService.js에 있던 uploadFileToFTP을 이동 및 코드 수정 (업로드 코드 통합)
\*\*\* 이미지 파일 업로드시 클라단에서 imageType을 전달해야한다.

### userService.js :

createMongoUser부분을 authModel.js로 위치 변경

### auth :

authRoute.js의 회원가입에 uploadFileToFTP 추가 및 엔드포인트 통일(노션의 api명세서 참조)
authController.js의 signup 부분 수정
authService.js의 createUser 부분 수정
authModel.js의 createUser 코드 수정 및 createMongoUser추가

## 2. post

### postRoute.js :

엔드포인트 수정 index.js의 [ app.use("/api/posts", postRoute) ]의 경우 엔드포인트에 기본으로 /api/posts 이 부분이 존재하기에 중복요소 제거
수정의 일부 :
// 게시글 작성
router.post('/post', postController.createPost); => router.post('/', postController.createPost);
엔드포인트 예 :
http://localhost8080/api/posts/post => http://localhost8080/api/posts

## 3. feed

### feedRoute.js :

위와 동일한 이유로 엔드포인트 수정
feed 작성 및 수정에 upload.single('feedImage'), uploadFileToFTP 추가

### feedController.js :

피드 생성 및 수정에 img 추가

### feedService.js :

return 추가

### feedModel.js :

return할 값 지정 및 where절 state 제거 (클라단에서 필터링 추후 분할 관리 필요하면 엔드포인트 생성)
createFeed와 updateFeed의 큰 변경점 img

## 4. user

일단 user중에서 팔로우~좋아요 기능까지만 수정
\*\*\* user get update등 유저에 자체에 관한 사항은 수정 x

### userRoute.js :

엔드포인트 수정
좋아요 기능 통합 클라단에서 type 및 id값(post_number, feed_number등) 전달

### userController.js :

좋아요 기능 통합 위와 같음

### userService.js :

좋아요 기능 통합 위와 같음

# 2025-01-03 오후 feature/all 수정사항

## 0. middlewares

### flieUpload.js:

복수 이미지 저장 기능 구현
그 결과로 단일 이미지로 저장 되었던 부분 수정 : 일단 배열로 이미지 url를 저장하고 가져온뒤 사용한다.

authRoute authController
feedRoute feedController
noticeRoute noticeController
userRoute userController

fileUplload 사용 예시

```
<form action="/upload" method="POST" enctype="multipart/form-data">
  <input type="file" name="profilePicture" />
  <input type="file" name="feedPicture" />
  <input type="file" name="noticePicture" multiple />
  <button type="submit">Upload</button>
</form>
```

## 1.notice

### noticeRoute.js :

공지 작성 및 수정에 fileUpload 미들웨어 추가

### noticeController.js :

공지 작성 및 수정기능에 이미지 추가 적용

### noticeService.js :

공지 작성 및 수정기능에 이미지 추가 적용

### noticeModel.js :

공지 작성 및 수정기능에 이미지 추가 적용 및 updateNoticeImages 코드 추가
