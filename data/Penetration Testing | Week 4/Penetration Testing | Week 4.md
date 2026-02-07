--- meta
title: Penetration Testing | Week 4
date: 2025/04/26
excerpt: 웹 프록시와 Burp Suite
categories: 모의 해킹
---

### 강의 노트

#### 웹 프록시

<strong>웹 프록시(Web Proxy)</strong>란 클라이언트와 웹 서버 사이의 중계 서버로, 프록시 서버라고도 한다. 웹 프록시를 사용하면 사용자가 직접 웹사이트에 접속하지 않고 프록시 서버를 거쳐서 간접적으로 접근하게 된다.

사용자가 특정 웹 페이지를 요청하면, 해당 요청은 먼저 프록시 서버로 전달된다. 프록시 서버는 이 요청을 대신 처리하여 웹 서버와 통신하며, 응답을 받으면 이를 사용자에게 반환한다.

![웹 프록시](/data/Penetration%20Testing%20|%20Week%204/1.png)

---

#### Burp Suite

**Burp Suite**는 프록시 서버 역할을 수행함과 동시에, 단순히 요청과 응답을 중계하는 것을 넘어 통신 내용을 능동적으로 분석하고 조작할 수 있는 기능을 제공하는 웹 프록시 툴이다.

보안 분야에서 가장 많이 사용되는 표준 도구 중 하나로, 무료로 제공되는 Community Edition과 더 많은 기능을 지원하는 유료 버전 Professional Edition이 있다. 다음 링크에서 무료 버전을 직접 설치하여 실습해 보자.

[https://portswigger.net/burp/communitydownload](https://portswigger.net/burp/communitydownload)

![Burp Suite](/data/Penetration%20Testing%20|%20Week%204/2.png)

Burp Suite에서 프록시 기능을 사용하려면 <strong>프록시 리스너(Proxy Listener)</strong>가 설정되어 있어야 한다. **프록시 리스너**란 클라이언트의 트래픽을 수신하기 위하여 열어두는 입구와 같은 개념이다. 설정에서 Proxy Listener 탭을 보면 기본적으로 다음과 같이 지정되어 있다.

![프록시 리스너](/data/Penetration%20Testing%20|%20Week%204/3.png)

`127.0.0.1`(로컬)의 8080 포트에 리스너가 설정되어 있으므로, 클라이언트의 트래픽이 `127.0.0.1:8080`으로 도착하면 프록시 툴이 이를 관리할 수 있다.

프록시 리스너를 추가할 경우 다음과 같은 바인딩 옵션에 유의해야 한다.

![프록시 리스너 바인딩 옵션](/data/Penetration%20Testing%20|%20Week%204/4.png)

- **Loopback Only**  
: 리스너를 `127.0.0.1`(로컬)에 바인딩한다. 같은 컴퓨터 내부의 트래픽만 받을 수 있다.
- **All Interfaces**  
: 리스너를 `0.0.0.0`(모든 인터페이스)에 바인딩한다. 모든 외부 트래픽을 받을 수 있다.
- **Specific Address**  
: 리스너를 특정 IP 주소에 바인딩한다. 특정 IP주소로부터의 트래픽만 받을 수 있다.

프록시 리스너를 설정했다면, 웹 브라우저에서 프록시 설정을 통해 프록시 서버를 지정해 주어야 한다.  
Chrome에서 [설정] - [시스템] - [컴퓨터 프록시 설정 열기]를 선택하여 다음과 같이 설정한다.

<img src="/data/Penetration%20Testing%20%7C%20Week%204/5.png" alt="프록시 설정" style="padding: 0 20%; background-color: white">

이후 브라우저에서 웹 사이트에 접속하면, 다음과 같이 Burp Suite에서 트래픽을 확인할 수 있다.

![프록시 설정 확인](/data/Penetration%20Testing%20|%20Week%204/6.png)

민약 Burp Suite를 켜지 않은 채로 웹 페이지를 요청하면, `ERR_PROXY_CONNECTION_FAILED` 오류가 발생한다.

![프록시 연결 오류](/data/Penetration%20Testing%20|%20Week%204/7.png)

<br>
<br>
<br>

### 과제

#### Burp CTF

![Burp CTF](/data/Penetration%20Testing%20|%20Week%204/8.png)

Burp Suite 사용에 익숙해지기 위해 SegFault 실습 사이트의 Burp CTF를 해결해 보자.

<br>

##### Burp Suite Prac 1

<img src="/data/Penetration%20Testing%20%7C%20Week%204/9.png" alt="Burp Suite Prac 1" style="padding: 0 25%; background-color: white">

링크의 주소로 접속하면 다음과 같은 웹 페이지로 이동한다.

![Burp Suite Prac 1](/data/Penetration%20Testing%20|%20Week%204/10.png)

표면상으로는 아무런 데이터가 없는 듯 보였지만 확인 차 소스 코드를 살펴 본 결과 다음과 같았다.

![Burp Suite Prac 1](/data/Penetration%20Testing%20|%20Week%204/11.png)

HTTP 요청의 헤더를 조작해야 하므로 Burp Suite의 Intercept 기능을 활용해 데이터 패킷을 가로채고 내용을 확인하였다.

![Burp Suite Prac 1](/data/Penetration%20Testing%20|%20Week%204/12.png)

`User-Agent` 필드의 값을 `segfaultDevice`로 수정 후 요청을 서버로 전달(Forward)하였다.

![Burp Suite Prac 1](/data/Penetration%20Testing%20|%20Week%204/13.png)

이후 다음과 같은 메시지가 표시되며, 소스 코드를 확인하여 플래그를 획득하였다.

![Burp Suite Prac 1](/data/Penetration%20Testing%20|%20Week%204/14.png)
![Burp Suite Prac 1](/data/Penetration%20Testing%20|%20Week%204/15.png)

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px); overflow-wrap:anywhere;">ModRequest</span>}</span></p>

<br>

##### Burp Suite Prac 2

<img src="/data/Penetration%20Testing%20%7C%20Week%204/16.png" alt="Burp Suite Prac 2" style="padding: 0 25%; background-color: white">

링크의 주소로 접속하면 다음과 같은 웹 페이지로 이동한다.

![Burp Suite Prac 2](/data/Penetration%20Testing%20|%20Week%204/17.png)
![Burp Suite Prac 2](/data/Penetration%20Testing%20|%20Week%204/18.png)

소스 코드에는 일부 내용이 작성되어 있었으나, 인코딩 오류인지 한글이 정상적으로 표시되지 않았다. LOOK INSIDE 메시지를 바탕으로 Burp Suite 내부에서 서버의 응답 내용을 확인해 보았다.

![Burp Suite Prac 2](/data/Penetration%20Testing%20|%20Week%204/19.png)

그 결과, `a.html`과 `b.html` 파일의 데이터를 확인해 보라는 메시지가 소스 코드에 숨겨져 있음을 확인할 수 있었다. 현재 웹 페이지의 경로가 `ctf.segfaulthub.com:1019/2_burp/` 형태였으므로, 해당 경로 뒤에 각각 `a.html`과 `b.html`을 추가하여 접근하였다.

![Burp Suite Prac 2](/data/Penetration%20Testing%20|%20Week%204/20.png)
![Burp Suite Prac 2](/data/Penetration%20Testing%20|%20Week%204/21.png)

각 링크에 접속한 결과, 동일해 보이는 매우 긴 텍스트가 출력되었다. 두 파일 간의 차이를 보다 명확히 확인하기 위해 Burp Suite의 Comparer 기능을 활용하여 비교를 수행하였다.

![Burp Suite Prac 2](/data/Penetration%20Testing%20|%20Week%204/22.png)

비교 결과, `b.html` 파일에만 segfault와 {<span style="filter: blur(5px); overflow-wrap:anywhere;">lookEasy</span>}라는 텍스트가 추가되어 있음을 확인할 수 있었다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px); overflow-wrap:anywhere;">lookEasy</span>}</span></p>

<br>

##### Burp Suite Prac 3

<img src="/data/Penetration%20Testing%20%7C%20Week%204/23.png" alt="Burp Suite Prac 3" style="padding: 0 25%; background-color: white">

링크의 주소로 접속하면 다음과 같은 웹 페이지로 이동한다.

![Burp Suite Prac 3](/data/Penetration%20Testing%20|%20Week%204/24.png)

소스 코드에도 별다른 내용은 없었으므로, 바로 Burp Suite에서 패킷을 분석해 보았다.

![Burp Suite Prac 3](/data/Penetration%20Testing%20|%20Week%204/25.png)

응답의 `Set-Cookie` 헤더에 `answer=1` 값이 설정되어 있다는 점이 눈에 띄었다. 그 외에 별다른 특이사항은 발견할 수 없어 우선 Press F5 메시지를 바탕으로 페이지를 새로고침한 후 다시 패킷을 확인하였다.

![Burp Suite Prac 3](/data/Penetration%20Testing%20|%20Week%204/26.png)

새로고침 이후 요청에 `Cookie` 헤더가 생성되었으며 마찬가지로 `answer=1`값이 설정되어 있음을 확인할 수 있었다. 1 ~ 20이라는 힌트로 미루어 보아 `answer`에 `1`부터 `20`까지의 값을 넣어서 전송하면 플래그를 얻을 수 있을 것으로 예측되었고, 해당 패킷을 Repeater로 전달하였다.

<img src="/data/Penetration%20Testing%20%7C%20Week%204/27.png" alt="Burp Suite Prac 3" style="padding: 0 25%; background-color: #262627">

Repeater에서 `answer` 값을 변경하면서 반복적으로 요청을 전송하였더니, `answer=13`일 때 플래그가 출력되는 것을 확인할 수 있었다.

![Burp Suite Prac 3](/data/Penetration%20Testing%20|%20Week%204/28.png)

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px); overflow-wrap:anywhere;">RePeatAgain</span>}</span></p>

<br>

##### Burp Suite Prac 4

<img src="/data/Penetration%20Testing%20%7C%20Week%204/29.png" alt="Burp Suite Prac 4" style="padding: 0 25%; background-color: white">

링크의 주소로 접속하면 다음과 같은 웹 페이지로 이동한다.

![Burp Suite Prac 4](/data/Penetration%20Testing%20|%20Week%204/30.png)

마찬가지로 소스 코드에는 별다른 내용이 없어 바로 패킷 분석을 진행하였다.

![Burp Suite Prac 4](/data/Penetration%20Testing%20|%20Week%204/31.png)

요청을 자세히 살펴 보니 `Cookie` 헤더에 `level=dXNlcg%3D%3D`이라는 값이 존재함을 알 수 있었다.  
인코딩된 텍스트라고 생각되어 Decoder 탭에서 디코딩을 진행하였다.

![Burp Suite Prac 4](/data/Penetration%20Testing%20|%20Week%204/32.png)

몇 차례 시도한 끝에 URL - base64 디코딩을 통해 `user`라는 텍스트임을 확인하였다. You are Not Admin 메시지를 고려하여 `user`를 `admin`으로 수정하고, base64 - URL 순서로 인코딩한 뒤 요청을 전송해 보았다.

![Burp Suite Prac 4](/data/Penetration%20Testing%20|%20Week%204/33.png)
![Burp Suite Prac 4](/data/Penetration%20Testing%20|%20Week%204/34.png)

`WXpKV2JscHRSakZpU0ZJM1VrZFdhbUl5VW14VmJWWjNXbGRHTUdaUlBUMD0=`라는 텍스트가 출력되었다.  
마찬가지로 디코딩을 진행해 보았다.

![Burp Suite Prac 4](/data/Penetration%20Testing%20|%20Week%204/35.png)

base64 디코딩을 3번 반복하여 플래그를 획득할 수 있었다.

<p style="text-align: center;">Flag: <span style="color: green">segfault{<span style="filter: blur(5px); overflow-wrap:anywhere;">DecodeRepeat</span>}</span></p>

---

#### 게시판 구현

게시판을 구현하기에 앞서, 효율적인 유지 보수를 위해 각 기능을 개별 파일로 분리하여 전체적인 구조를 먼저 구성하였다.

```bash
board/
├── db.php         # 데이터베이스 연결 파일
├── index.php      # 게시판 메인 페이지(게시글 목록 출력)
├── signup.php     # 회원 가입 처리
├── login.php      # 로그인 처리
├── logout.php     # 로그아웃 처리(세션 종료)
├── mypage.php     # 사용자 마이페이지
├── view.php       # 게시글 상세 보기
├── write.php      # 게시글 작성
├── edit.php       # 게시글 수정
├── delete.php     # 게시글 삭제
└── style.css      # 전체 페이지 스타일시트
```

3주차까지 학습한 내용을 바탕으로 각 기능을 구현하였다.  
각 파일의 소스 코드를 모두 본문에 포함할 경우 문서의 길이가 지나치게 길어지므로, 이를 압축하여 zip 파일 형태로 첨부한다.

<a href="/data/Penetration%20Testing%20|%20Week%204/board.zip" download>board.zip</a>