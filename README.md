# back-node.js
본 프로젝트는 mvc패턴을 이용하여 유지 보수성을 높이려 하였다.<br>

 프로젝트의 규모가 크지 않고 토이 프로젝트로 배포 테스트까지를 목표로 두었다. <br>
 때문에 비용 절감을 위해 관리자와 유저의 처리를 한 백서버에서 처리하였다. <br>

데이터의 저장에 있어서 조회가 잦은 특성을 고려하여 메모리 데이터베이스를 적용하였으며<br>
데이터의 중요도와 특성에 따라 MongoDB와 postgreSQL을 혼합 사용하였다.<br>

## 프로젝트 데이터 베이스 스키마
s